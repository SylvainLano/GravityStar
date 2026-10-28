import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { createSharedUniforms, createSurfaceMaterial, createOutlineMaterial, createHaloMaterial, rgb } from '../skins/styleMaterials';
import { createParodiusLook } from '../skins/parodius';
import { ParodiusPlanet, ParodiusStar, hasParodiusCharacter } from '../skins/ParodiusCharacters';

// The candidate styles, in the order of the number keys
const styles = [
  { id: 'realistic', name: 'Realistic', description: 'The current look: photo textures and physical lighting.' },
  { id: 'cel', name: 'Cel shading', description: 'Comic book: vivid flattened textures, three light bands, violet shadows, ink outline and hatching.' },
  { id: 'pastel', name: 'Pastel', description: 'Soft washes on paper: cool shadows rather than dark ones, pigment grain, darker and ragged edges.' },
  { id: 'anime', name: 'Anime', description: 'Hard terminator with a warm band, screentone in the shadow, atmosphere rim and lens glare.' },
  { id: 'arcade', name: '16-bit arcade', description: 'Low resolution, a few light levels, limited palette and ordered dithering.' },
  { id: 'parodius', name: 'Parodius', description: 'Prototype: flat vivid colors drawn from the real textures, sprite lighting, Jupiter as a tabby cat and the star in sunglasses.' },
];

// Background and stars of each style (pastel has no background color: its paper is drawn by CSS behind the canvas)
const backdrops = {
  realistic: { background: '#000000', stars: { color: '#ffffff', size: 2, round: true, opacity: 0.8 } },
  // Ultramarine rather than black, so that the ink outlines stand out against the sky
  cel: { background: '#252c70', stars: { color: '#ffe9a8', size: 2, round: true, opacity: 0.9 } },
  pastel: { background: null, stars: { color: '#3e4470', size: 3, round: true, opacity: 0.45 } },
  anime: { background: '#050a1f', stars: { color: '#ffffff', size: 2, round: true, opacity: 0.9 } },
  arcade: { background: '#000000', stars: { color: '#ffffff', size: 1, round: false, opacity: 1 } },
  parodius: { background: '#120a3a', stars: { colors: ['#ffffff', '#ff7ad9', '#7ae8ff', '#ffe066'], size: 1.5, round: false, opacity: 1 } },
};

// Planets as in the game: size (multiplied by the planet size factor), orbit radius and days per orbit.
// All of them also appear, much bigger, in the close-up view.
const planets = [
  { name: 'mercury', texture: './img/2k_mercury.jpg', size: 0.0349, orbit: 1.2, days: 938, angle: 0.3, rim: '#c9c2b8', closeUp: { position: [-1.2, 1.6, 0.2], radius: 0.4 } },
  { name: 'venus', texture: './img/2k_venus_atmosphere.jpg', size: 0.055, orbit: 1.84, days: 1559, angle: 2.1, rim: '#ffd9a0', closeUp: { position: [-3.1, 1.4, -0.8], radius: 0.55 } },
  { name: 'earth', texture: './img/2k_earth_daymap.jpg', size: 0.05644, orbit: 2.4, days: 1910, angle: 4.0, rim: '#5ab8ff', closeUp: { position: [-2.7, -0.6, 0.6], radius: 0.6 } },
  { name: 'mars', texture: './img/2k_mars.jpg', size: 0.0412, orbit: 3.44, days: 2621, angle: 5.2, rim: '#ff9f80', closeUp: { position: [-0.9, -0.3, 1.4], radius: 0.5 } },
  { name: 'jupiter', texture: './img/2k_jupiter.jpg', size: 0.1889, orbit: 6.6, days: 6583, angle: 1.0, rim: '#a8865a', closeUp: { position: [0.9, 0.7, -1.4], radius: 1.2 } },
  { name: 'saturn', texture: './img/2k_saturn.jpg', size: 0.1706, orbit: 9.9, days: 10373, angle: 3.3, rim: '#e6d3a0', closeUp: { position: [3.5, 1.8, -1.5], radius: 0.55 } },
  { name: 'uranus', texture: './img/2k_uranus.jpg', size: 0.1126, orbit: 13.4, days: 17517, angle: 5.8, rim: '#9ff0f0', closeUp: { position: [3.0, -0.7, 0.6], radius: 0.5 } },
  { name: 'neptune', texture: './img/2k_neptune.jpg', size: 0.1105, orbit: 17.4, days: 24500, angle: 2.6, rim: '#7aa8ff', closeUp: { position: [1.2, -1.3, 1.6], radius: 0.5 } },
];

// Close-up: big planets to look at the details. Game: the sizes and camera of the game, to judge what players will see.
const views = {
  closeUp: { camera: [0, 1.2, 9], fov: 40, sunRadius: 0.6, asteroid: { position: [-0.6, -2.0, 2.4], scale: 0.1 } },
  game: { camera: [0, 5, 6], fov: 75, sunRadius: 0.4, asteroid: { position: [0, 3.25, 4.5], scale: 0.02 } },
};
// The game's spotlight at the camera, that shows the asteroids before they are launched
const spotRange = 4;

const sphereGeometry = new THREE.SphereGeometry(1, 96, 96);
// In the close-up view, the star turns around the scene at this distance, to light it from different angles
const orbitRadius = 4.2;

// Materials and asteroid model of every style, created once
function buildLooks({ maps, sunMap, gltf, shared }) {
  // The realistic star keeps the colors it has in the game, where its texture is not converted from sRGB
  const realisticSunMap = sunMap.clone();
  realisticSunMap.colorSpace = THREE.NoColorSpace;

  const looks = {
    realistic: {
      planets: Object.fromEntries(planets.map((planet) => [planet.name, { material: new THREE.MeshStandardMaterial({ map: maps[planet.name] }) }])),
      sun: new THREE.MeshBasicMaterial({ map: realisticSunMap }),
      asteroid: gltf.scene.clone(true),
    },
  };

  for (const style of ['cel', 'pastel', 'anime', 'arcade']) {
    const surface = (map, options = {}) => createSurfaceMaterial(style, { map, shared, ...options });
    // Ink lines, in screen pixels: brush-like for the comic book, thin and even for the anime, none for the others
    const outline = (thickness, lightVariation = true) => {
      if (style === 'cel') return createOutlineMaterial({ shared, thickness, color: '#0a0820', lightVariation });
      if (style === 'anime') return createOutlineMaterial({ shared, thickness: thickness * 0.5, color: '#0b0f2a', lightVariation: false });
      return null;
    };

    // The asteroid model gets the style's material, with its own texture, and its outline
    const asteroid = gltf.scene.clone(true);
    const meshes = [];
    asteroid.traverse((object) => { if (object.isMesh) meshes.push(object); });
    for (const mesh of meshes) {
      mesh.material = surface(mesh.material.map);
      const asteroidOutline = outline(1.6);
      if (asteroidOutline) mesh.add(new THREE.Mesh(mesh.geometry, asteroidOutline));
    }

    looks[style] = {
      planets: Object.fromEntries(planets.map((planet) => [planet.name, {
        material: surface(maps[planet.name], { rimColor: planet.rim }),
        outline: outline(2),
      }])),
      sun: surface(sunMap, { emissive: true }),
      sunOutline: outline(2, false),
      halo: style === 'pastel' || style === 'anime' ? createHaloMaterial(style) : null,
      asteroid,
    };
  }

  // Parodius: flat vivid colors, sprite lighting and a thin dark line, with characters for some planets and the star
  looks.parodius = createParodiusLook({ shared, maps, gltf });

  return looks;
}

// A sphere and its outline, spinning inside its group
function Body({ radius, material, outlineMaterial, spinRef }) {
  return (
    <group ref={spinRef}>
      <mesh geometry={sphereGeometry} material={material} scale={radius} />
      {outlineMaterial && <mesh geometry={sphereGeometry} material={outlineMaterial} scale={radius} />}
    </group>
  );
}

// character: in the Parodius style, the materials of the character drawn instead of the planet
function Planet({ planet, look, character, view, rotate, planetSizeFactor }) {
  const orbitRef = useRef();
  const spinRef = useRef();
  const angle = useRef(planet.angle);
  const isGame = view === 'game';
  const radius = isGame ? planet.size * planetSizeFactor : planet.closeUp.radius;

  useFrame((state, delta) => {
    if (rotate) {
      if (spinRef.current) spinRef.current.rotation.y += delta * 0.2;
      // Same orbital speed as in the game at 60 frames per second
      if (isGame) angle.current += delta * 60 * (10 / planet.days) / planet.orbit;
    }
    if (isGame) orbitRef.current.position.set(planet.orbit * Math.cos(angle.current), 0, -planet.orbit * Math.sin(angle.current));
  });

  return (
    <group ref={orbitRef} position={isGame ? undefined : planet.closeUp.position} rotation={[0, 0, planet.name === 'earth' ? 0.4 : 0]}>
      {character
        ? <ParodiusPlanet name={planet.name} radius={radius} look={character} spinRef={spinRef} />
        : <Body radius={radius} material={look.material} outlineMaterial={look.outline} spinRef={spinRef} />}
    </group>
  );
}

// colors: several colors spread at random among the stars, instead of a single color
function Stars({ color, colors, size, round, opacity, shared }) {
  // The same random stars for every style
  const geometry = useMemo(() => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const positions = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i++) {
      const angle = random() * Math.PI * 2;
      const z = random() * 2 - 1;
      const r = Math.sqrt(1 - z * z);
      positions.set([30 * r * Math.cos(angle), 30 * z, 30 * r * Math.sin(angle)], i * 3);
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('starColor', new THREE.BufferAttribute(new Float32Array(700 * 3), 3));
    return starsGeometry;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      size: { value: 2 },
      round: { value: 1 },
      opacity: { value: 1 },
      pixelRatio: shared.pixelRatio,
    },
    vertexShader: /* glsl */ `
      uniform float size;
      uniform float pixelRatio;
      attribute vec3 starColor;
      varying vec3 vColor;
      void main() {
        vColor = starColor;
        gl_PointSize = max(1.0, size * pixelRatio);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float round;
      uniform float opacity;
      varying vec3 vColor;
      void main() {
        if (round > 0.5 && length(gl_PointCoord - 0.5) > 0.5) discard;
        gl_FragColor = vec4(vColor, opacity);
      }
    `,
    transparent: true,
    depthWrite: false,
  }), [shared]);

  useLayoutEffect(() => {
    const palette = (colors ?? [color]).map(rgb);
    const starColors = geometry.attributes.starColor;
    let seed = 11;
    for (let i = 0; i < starColors.count; i++) {
      seed = (seed * 16807) % 2147483647;
      const starColor = palette[seed % palette.length];
      starColors.setXYZ(i, starColor.x, starColor.y, starColor.z);
    }
    starColors.needsUpdate = true;
    material.uniforms.size.value = size;
    material.uniforms.round.value = round ? 1 : 0;
    material.uniforms.opacity.value = opacity;
  }, [geometry, material, color, colors, size, round, opacity]);

  return <points geometry={geometry} material={material} />;
}

// Moves the camera to the chosen view
function ViewCamera({ view }) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.set(...views[view].camera);
    camera.fov = views[view].fov;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  }, [camera, view]);
  return null;
}

function LabScene({ style, view, lightAngle, rotate, planetSizeFactor }) {
  const textures = useLoader(THREE.TextureLoader, ['./img/2k_sun.jpg', ...planets.map((planet) => planet.texture)]);
  const gltf = useLoader(GLTFLoader, './models/meteorite/meteorite.glb');
  const shared = useMemo(createSharedUniforms, []);

  const looks = useMemo(() => {
    for (const texture of textures) texture.colorSpace = THREE.SRGBColorSpace;
    const [sunMap, ...planetMaps] = textures;
    const maps = Object.fromEntries(planets.map((planet, i) => [planet.name, planetMaps[i]]));
    return buildLooks({ maps, sunMap, gltf, shared });
  }, [textures, gltf, shared]);
  const look = looks[style];
  const backdrop = backdrops[style];
  const isGame = view === 'game';
  const sunRadius = views[view].sunRadius;

  // Screen-space effects (outlines, hatching, screentone, paper grain) keep the same size whatever the pixel ratio
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  useLayoutEffect(() => {
    shared.pixelRatio.value = dpr;
    shared.resolution.value.set(size.width * dpr, size.height * dpr);
  }, [size, dpr, shared]);

  // In the game view the star is at the center. In the close-up view, angle 0 puts it behind the scene, 90 on its right and -90 on its left.
  const sunPosition = useMemo(() => {
    if (isGame) return new THREE.Vector3(0, 0, 0);
    const angle = THREE.MathUtils.degToRad(lightAngle);
    return new THREE.Vector3(orbitRadius * Math.sin(angle), 0.8, -orbitRadius * Math.cos(angle));
  }, [isGame, lightAngle]);
  useLayoutEffect(() => { shared.lightPosition.value.copy(sunPosition); }, [sunPosition, shared]);

  // The spotlight only exists in the game view
  useLayoutEffect(() => {
    shared.spotPosition.value.set(...views.game.camera);
    shared.spotRange.value = isGame ? spotRange : 0;
  }, [isGame, shared]);

  const sunSpin = useRef();
  const asteroidSpin = useRef();
  useFrame((state, delta) => {
    if (!rotate) return;
    if (sunSpin.current) sunSpin.current.rotation.y += delta * 0.05;
    asteroidSpin.current.rotation.x += delta * 0.3;
    asteroidSpin.current.rotation.y += delta * 0.2;
  });

  return (
    <>
      <ViewCamera view={view} />
      {backdrop.background && <color attach="background" args={[backdrop.background]} />}

      {/* Light of the star for the realistic materials (the stylized ones do their own lighting), with the game's values in the game view */}
      <pointLight position={sunPosition} intensity={isGame ? 18 : 26} distance={isGame ? 19 : 0} decay={0.75} />
      {isGame && <spotLight position={views.game.camera} intensity={15} distance={spotRange} angle={Math.PI / 3} penumbra={0} />}

      <Stars {...backdrop.stars} shared={shared} />

      <group position={sunPosition}>
        {look.star
          ? <ParodiusStar radius={sunRadius} look={look.star} />
          : <Body radius={sunRadius} material={look.sun} outlineMaterial={look.sunOutline} spinRef={sunSpin} />}
        {look.halo && (
          <Billboard>
            <mesh material={look.halo}>
              <planeGeometry args={style === 'anime' ? [sunRadius * 10, sunRadius * 10] : [sunRadius * 5.7, sunRadius * 5.7]} />
            </mesh>
          </Billboard>
        )}
      </group>

      {planets.filter((planet) => isGame || planet.closeUp).map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          look={look.planets[planet.name]}
          character={look.characters && hasParodiusCharacter(planet.name) ? look.characters[planet.name] : null}
          view={view}
          rotate={rotate}
          planetSizeFactor={planetSizeFactor}
        />
      ))}

      <group position={views[view].asteroid.position} scale={views[view].asteroid.scale}>
        <group ref={asteroidSpin}>
          <primitive object={look.asteroid} />
        </group>
      </group>
    </>
  );
}

export default function Lab() {
  const [style, setStyle] = useState('realistic');
  const [view, setView] = useState('closeUp');
  const [lightAngle, setLightAngle] = useState(110);
  const [rotate, setRotate] = useState(true);
  const [pixelSize, setPixelSize] = useState(1.5);
  const [planetSizeFactor, setPlanetSizeFactor] = useState(2);

  // Keys 1 to 5 switch between the styles, G between the close-up and game views
  useEffect(() => {
    const onKeyDown = (e) => {
      const keyStyle = styles[Number(e.key) - 1];
      if (keyStyle) setStyle(keyStyle.id);
      if (e.key === 'g' || e.key === 'G') setView((previous) => (previous === 'game' ? 'closeUp' : 'game'));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // The arcade and Parodius styles are rendered with big pixels, each pixelSize pixels of the screen, then scaled up without smoothing
  const pixelated = style === 'arcade' || style === 'parodius';
  const dpr = pixelated ? window.devicePixelRatio / pixelSize : [1, 2];
  const current = styles.find((candidate) => candidate.id === style);

  return (
    <div className={`lab ${style}`}>
      <Canvas dpr={dpr} camera={{ position: views.closeUp.camera, fov: views.closeUp.fov }}>
        <Suspense fallback={null}>
          <LabScene style={style} view={view} lightAngle={lightAngle} rotate={rotate} planetSizeFactor={planetSizeFactor} />
        </Suspense>
      </Canvas>

      <div className="lab-panel">
        <div className="lab-title">Gravity Star · style lab</div>
        <div className="lab-buttons">
          {styles.map((candidate, i) => (
            <button key={candidate.id} className={candidate.id === style ? 'active' : ''} onClick={() => setStyle(candidate.id)}>
              {i + 1}. {candidate.name}
            </button>
          ))}
        </div>
        <p className="lab-description">{current.description}</p>
        <div className="lab-buttons">
          <button className={view === 'closeUp' ? 'active' : ''} onClick={() => setView('closeUp')}>Close-up</button>
          <button className={view === 'game' ? 'active' : ''} onClick={() => setView('game')}>As in the game (G)</button>
        </div>
        {view === 'closeUp' && (
          <label className="lab-control">
            Light
            <input type="range" min={-150} max={150} step={1} value={lightAngle} onChange={(e) => setLightAngle(Number(e.target.value))} />
          </label>
        )}
        <label className="lab-control">
          <input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)} />
          Rotate
        </label>
        {view === 'game' && (
          <div className="lab-buttons">
            Planet size:
            {[2, 3, 4].map((factor) => (
              <button key={factor} className={factor === planetSizeFactor ? 'active' : ''} onClick={() => setPlanetSizeFactor(factor)}>×{factor}</button>
            ))}
          </div>
        )}
        {pixelated && (
          <div className="lab-buttons">
            Pixel size (screen pixels):
            {[1.5, 2, 3, 4].map((size) => (
              <button key={size} className={size === pixelSize ? 'active' : ''} onClick={() => setPixelSize(size)}>{size}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
