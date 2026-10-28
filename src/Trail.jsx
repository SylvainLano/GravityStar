import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useSimulation } from './SimulationClock';
import { rgb } from './skins/styleMaterials';

// Trails left behind the moving bodies, drawn as ribbons of a width in screen pixels that thin out and fade towards their tail.
// They follow the simulated time, so they stop during a pause and keep the same length at any speed.

// The trail settings go from 0 (no trail) to 10: each step doubles its length, from 1 second to about 8 and a half minutes
export function trailDuration(setting) {
  return setting > 0 ? 2 ** (setting - 1) * 1000 : 0;
}

// Points kept along a trail: spread over its whole length, and closer together where it turns, so that curves stay smooth.
// A body turning fast on a long trail (Mercury on the longest one) may use them all: its oldest points are then forgotten first.
const maxSamples = 1024;
const cosineOfTurn = Math.cos(THREE.MathUtils.degToRad(3)); // A new point every 3 degrees of turn
const maxPoints = maxSamples + 1; // And the body's current position
const stepDuration = 1000 / 60;

// Drawing styles of the skins (see trail in skins.js):
//   glow: soft edges and a bright core; ink: an ink border (comic); pixels: dashes fading in steps (arcade);
//   candy: round dots of several colors (Neko Nebula); chalk: strokes broken by the paper's grain; wash: a wide wash with darker edges
const styles = { glow: 0, ink: 1, pixels: 2, candy: 3, chalk: 4, wash: 5 };

// The two triangles of each segment between consecutive points, for the longest trail
const indices = (() => {
  const array = new Uint16Array((maxPoints - 1) * 6);
  for (let i = 0; i < maxPoints - 1; i++) array.set([2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2], i * 6);
  return array;
})();

const vertexShader = /* glsl */ `
  uniform vec2 resolution;
  uniform float pixelRatio;
  uniform float width;
  uniform float now; // The simulated time, and the trail's length, to know the age of each point
  uniform float duration;
  attribute vec3 previous;
  attribute vec3 next;
  attribute float side;
  attribute float time;
  attribute float along;
  varying float vAge;
  varying float vSide;
  varying float vAlong;

  void main() {
    float age = clamp((now - time) / duration, 0.0, 1.0);
    vAge = age;
    vSide = side;
    vAlong = along;
    mat4 transform = projectionMatrix * modelViewMatrix;
    vec4 current = transform * vec4(position, 1.0);
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 here = current.xy / current.w * aspect;
    vec2 before = here - (transform * vec4(previous, 1.0)).xy / (transform * vec4(previous, 1.0)).w * aspect;
    vec2 after = (transform * vec4(next, 1.0)).xy / (transform * vec4(next, 1.0)).w * aspect - here;
    // The direction of the trail on screen, and the ribbon pushed out on both sides of it
    vec2 direction = length(before) > 1e-6 ? normalize(before) : vec2(1.0, 0.0);
    if (length(after) > 1e-6) direction = normalize(direction + normalize(after));
    vec2 normal = vec2(-direction.y, direction.x) / aspect;
    float pixels = width * pixelRatio * (0.3 + 0.7 * (1.0 - age));
    current.xy += normal * side * pixels / resolution.y * current.w;
    gl_Position = current;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 color;
  uniform vec3 inkColor;
  uniform vec3 candyColors[4];
  uniform int style;
  uniform float pixelRatio;
  varying float vAge;
  varying float vSide;
  varying float vAlong;

  float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float fade = 1.0 - vAge;
    float edge = abs(vSide);
    vec3 tint = color;
    float alpha = fade;

    if (style == 0) {
      // Glow: bright in the middle, soft on the edges
      alpha = fade * pow(1.0 - edge, 1.5);
      tint = mix(color, vec3(1.0), pow(1.0 - edge, 4.0) * 0.6);
    } else if (style == 1) {
      // Ink: the color inside an ink border
      tint = edge > 0.55 ? inkColor : color;
      alpha = smoothstep(0.0, 0.15, fade);
    } else if (style == 2) {
      // Pixels: dashes, fading in a few steps
      if (fract(vAlong / 0.12) > 0.55) discard;
      alpha = ceil(fade * 3.0) / 3.0;
    } else if (style == 3) {
      // Candy: round dots, each one of the next color
      float dotNumber = floor(vAlong / 0.09);
      vec2 inDot = vec2(fract(vAlong / 0.09) - 0.5, vSide * 0.5);
      if (length(inDot) > 0.4) discard;
      int index = int(mod(dotNumber, 4.0));
      tint = index == 0 ? candyColors[0] : index == 1 ? candyColors[1] : index == 2 ? candyColors[2] : candyColors[3];
      alpha = smoothstep(0.0, 0.3, fade);
    } else if (style == 4) {
      // Chalk: broken by the grain of the paper
      if (hash21(floor(gl_FragCoord.xy / pixelRatio / 1.5)) > 0.35 + 0.5 * fade) discard;
      alpha = fade * (1.0 - smoothstep(0.7, 1.0, edge));
    } else {
      // Wash: translucent, darker where the pigment gathered along its edges
      alpha = fade * (0.25 + 0.35 * smoothstep(0.55, 0.95, edge)) * (1.0 - smoothstep(0.92, 1.0, edge));
    }
    gl_FragColor = vec4(tint, alpha);
  }
`;

// target: the position of the body (a vector moved by it), duration: the length of the trail in simulated milliseconds,
// look: the trail of the skin (style, width, ink and candy colors), color: the color of this trail
const Trail = ({ target, duration, look, color }) => {
  const simulation = useSimulation();

  // The points kept, oldest first: x, y, z, time, and distance traveled along the trail.
  // They are copied into the ribbon only when one is added or forgotten: on the other frames, only its head moves.
  const samples = useRef({ data: new Float64Array(maxSamples * 5), start: 0, count: 0, along: 0, drawn: -1 });
  // A new body (a new random system): start again
  useEffect(() => {
    samples.current.count = 0;
    samples.current.drawn = -1;
  }, [target]);

  const geometry = useMemo(() => {
    const ribbon = new THREE.BufferGeometry();
    const vertices = maxPoints * 2;
    ribbon.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices * 3), 3));
    ribbon.setAttribute('previous', new THREE.BufferAttribute(new Float32Array(vertices * 3), 3));
    ribbon.setAttribute('next', new THREE.BufferAttribute(new Float32Array(vertices * 3), 3));
    ribbon.setAttribute('time', new THREE.BufferAttribute(new Float32Array(vertices), 1));
    ribbon.setAttribute('along', new THREE.BufferAttribute(new Float32Array(vertices), 1));
    ribbon.setAttribute('side', new THREE.BufferAttribute(Float32Array.from({ length: vertices }, (_, i) => (i % 2 === 0 ? -1 : 1)), 1));
    ribbon.setIndex(new THREE.BufferAttribute(indices, 1));
    ribbon.setDrawRange(0, 0);
    return ribbon;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Vector3(1, 1, 1) },
      inkColor: { value: rgb('#0a0820') },
      candyColors: { value: [0, 1, 2, 3].map(() => new THREE.Vector3(1, 1, 1)) },
      style: { value: 0 },
      width: { value: 3 },
      pixelRatio: { value: 1 },
      resolution: { value: new THREE.Vector2(1, 1) },
      now: { value: 0 },
      duration: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide, // The ribbon faces the camera from one side or the other, depending on where the trail goes
  }), []);
  useEffect(() => () => material.dispose(), [material]);

  useLayoutEffect(() => {
    material.uniforms.color.value.copy(rgb(color));
    material.uniforms.style.value = styles[look.style] ?? 0;
    material.uniforms.width.value = look.width ?? 3;
    (look.colors ?? [color]).forEach((candy, i) => material.uniforms.candyColors.value[i].copy(rgb(candy)));
    for (let i = (look.colors ?? [color]).length; i < 4; i++) material.uniforms.candyColors.value[i].copy(rgb(color));
  }, [material, look, color]);

  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  useLayoutEffect(() => {
    material.uniforms.pixelRatio.value = dpr;
    material.uniforms.resolution.value.set(size.width * dpr, size.height * dpr);
  }, [material, size, dpr]);

  useFrame(() => {
    const trail = samples.current;
    const now = simulation.current.time;
    if (duration <= 0) {
      // Switched off: what it kept would be out of date when it is switched on again
      trail.count = 0;
      trail.drawn = -1;
      geometry.setDrawRange(0, 0);
      return;
    }
    material.uniforms.now.value = now;
    material.uniforms.duration.value = duration;
    const { data } = trail;
    const at = (i) => ((trail.start + i) % maxSamples) * 5;
    let changed = false;

    // Keep a new point when the body has moved on for long enough, or when its path turns
    const last = trail.count > 0 ? at(trail.count - 1) : -1;
    let keep = last < 0 || now - data[last + 3] >= Math.max(stepDuration, duration / maxSamples);
    if (!keep && trail.count >= 2 && now - data[last + 3] >= stepDuration) {
      const before = at(trail.count - 2);
      const ax = data[last] - data[before];
      const ay = data[last + 1] - data[before + 1];
      const az = data[last + 2] - data[before + 2];
      const bx = target.x - data[last];
      const by = target.y - data[last + 1];
      const bz = target.z - data[last + 2];
      const lengths = Math.hypot(ax, ay, az) * Math.hypot(bx, by, bz);
      keep = lengths > 0 && ax * bx + ay * by + az * bz < lengths * cosineOfTurn;
    }
    if (keep) {
      if (last >= 0) trail.along += Math.hypot(target.x - data[last], target.y - data[last + 1], target.z - data[last + 2]);
      if (trail.count === maxSamples) {
        trail.start = (trail.start + 1) % maxSamples;
        trail.count--;
      }
      const added = at(trail.count);
      data[added] = target.x;
      data[added + 1] = target.y;
      data[added + 2] = target.z;
      data[added + 3] = now;
      data[added + 4] = trail.along;
      trail.count++;
      changed = true;
    }
    // Forget the points older than the trail's length
    while (trail.count > 0 && now - data[at(0) + 3] > duration) {
      trail.start = (trail.start + 1) % maxSamples;
      trail.count--;
      changed = true;
    }

    // The ribbon: the points kept, then the body where it is now
    const { position, previous, next, time, along } = geometry.attributes;
    const points = trail.count + 1;
    const lastSample = at(trail.count - 1);
    const headAlong = trail.count > 0
      ? trail.along + Math.hypot(target.x - data[lastSample], target.y - data[lastSample + 1], target.z - data[lastSample + 2])
      : trail.along;

    // Writes both vertices of a point of the ribbon
    const writePoint = (i, x, y, z, pointTime, pointAlong) => {
      for (let vertex = i * 2; vertex < i * 2 + 2; vertex++) {
        position.array[vertex * 3] = x;
        position.array[vertex * 3 + 1] = y;
        position.array[vertex * 3 + 2] = z;
        time.array[vertex] = pointTime;
        along.array[vertex] = pointAlong;
      }
    };
    // Gives a point the positions of the ones before and after it, to orient the ribbon
    const writeNeighbors = (i) => {
      const before = Math.max(0, i - 1) * 6;
      const after = Math.min(points - 1, i + 1) * 6;
      for (let vertex = i * 2; vertex < i * 2 + 2; vertex++) {
        for (let axis = 0; axis < 3; axis++) {
          previous.array[vertex * 3 + axis] = position.array[before + axis];
          next.array[vertex * 3 + axis] = position.array[after + axis];
        }
      }
    };

    // Everything when the points kept changed, else only the head and the point before it
    const first = changed || trail.drawn !== points ? 0 : Math.max(0, points - 2);
    for (let i = first; i < trail.count; i++) {
      const sample = at(i);
      writePoint(i, data[sample], data[sample + 1], data[sample + 2], data[sample + 3], data[sample + 4]);
    }
    writePoint(trail.count, target.x, target.y, target.z, now, headAlong);
    for (let i = first; i < points; i++) writeNeighbors(i);
    trail.drawn = points;

    // Send only what changed to the graphics card
    for (const attribute of [position, previous, next, time, along]) {
      attribute.clearUpdateRanges();
      attribute.addUpdateRange(first * 2 * attribute.itemSize, (points - first) * 2 * attribute.itemSize);
      attribute.needsUpdate = true;
    }
    geometry.setDrawRange(0, (points - 1) * 6);
  });

  // Never culled: its bounds change on every frame
  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
};

export default React.memo(Trail);
