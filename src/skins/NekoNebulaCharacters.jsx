import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import {
  createStarGeometry, createEarGeometry, createTentacleGeometry, createOnigiriGeometry, createSnorkelGeometry,
  createNightcapGeometry, nightcapTip, createSpikesGeometry,
} from './nekoNebula';

// Characters of the Neko Nebula skin, built for a radius of 1 and scaled to the body's radius.
// The planets spin on themselves through spinRef (Uranus around its tilted axis), the star always faces the player.

const sphereGeometry = new THREE.SphereGeometry(1, 96, 96);
const earGeometry = createEarGeometry(0.36, 0.62);
const innerEarGeometry = createEarGeometry(0.22, 0.4);
const tentacleGeometry = createTentacleGeometry();
const crownGeometry = new THREE.SphereGeometry(1.05, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
const ribbonGeometry = new THREE.CylinderGeometry(1.06, 1.06, 0.2, 64, 1, true);
const brimGeometry = new THREE.RingGeometry(1, 1.95, 96, 1);
const petalGeometry = new THREE.SphereGeometry(0.11, 16, 12);
const onigiriGeometry = createOnigiriGeometry();
const pearlGeometry = new THREE.SphereGeometry(0.13, 24, 16);
const hookGeometry = new THREE.SphereGeometry(0.05, 12, 8);
const snorkelGeometry = createSnorkelGeometry();
// Strap of the diving mask, around the back of the head: an open ring whose gap is at the front, behind the mask
const strapGap = THREE.MathUtils.degToRad(80);
const strapGeometry = new THREE.TorusGeometry(1.0, 0.055, 8, 64, Math.PI * 2 - strapGap);
const nightcapGeometry = createNightcapGeometry();
const capBandGeometry = new THREE.TorusGeometry(0.8, 0.11, 10, 48);
const pompomGeometry = new THREE.SphereGeometry(0.2, 20, 14);
const sleepZGeometry = new THREE.PlaneGeometry(1, 1);
const spikesGeometry = createSpikesGeometry();
const finGeometry = new THREE.SphereGeometry(1, 20, 14);
const starGeometry = createStarGeometry();
const starFaceGeometry = new THREE.PlaneGeometry(1.35, 1.35);

// The body of a planet: its material and its outline
function Head({ material, outline }) {
  return (
    <>
      <mesh geometry={sphereGeometry} material={material} />
      <mesh geometry={sphereGeometry} material={outline} />
    </>
  );
}

// Mercury: a grumpy onigiri
function Onigiri({ look }) {
  return (
    <>
      <mesh geometry={onigiriGeometry} material={look.body} />
      <mesh geometry={onigiriGeometry} material={look.outline} />
    </>
  );
}

// Venus: a diva wearing pearl earrings
function Diva({ look }) {
  return (
    <>
      <Head material={look.body} outline={look.outline} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.98, -0.3, 0.05]}>
          <mesh geometry={hookGeometry} material={look.gold} />
          <mesh geometry={pearlGeometry} material={look.pearl} position={[side * 0.04, -0.17, 0]} />
          <mesh geometry={pearlGeometry} material={look.outline} position={[side * 0.04, -0.17, 0]} />
        </group>
      ))}
    </>
  );
}

// Earth: a diver with a mask and a snorkel
function Diver({ look }) {
  return (
    <>
      <Head material={look.body} outline={look.outline} />
      {/* The ring starts on the side of the mask and goes round the back of the head, at the height of the eyes */}
      <group position={[0, 0.15, 0]} rotation={[0, -(Math.PI / 2 + strapGap / 2), 0]}>
        <mesh geometry={strapGeometry} material={look.strap} rotation={[Math.PI / 2, 0, 0]} />
      </group>
      <mesh geometry={snorkelGeometry} material={look.snorkel} />
      <mesh geometry={snorkelGeometry} material={look.outline} />
    </>
  );
}

function CatEar({ side, look }) {
  // Upper left or right of the head, leaning slightly forward
  const [position, quaternion] = useMemo(() => {
    const direction = new THREE.Vector3(side * 0.6, 0.77, 0.2).normalize();
    return [direction.clone().multiplyScalar(0.8), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)];
  }, [side]);
  return (
    <group position={position} quaternion={quaternion}>
      <mesh geometry={earGeometry} material={look.ear} />
      <mesh geometry={earGeometry} material={look.outline} />
      <mesh geometry={innerEarGeometry} material={look.innerEar} position={[0, 0.05, 0.1]} />
    </group>
  );
}

// Jupiter: a tabby cat head
function Cat({ look }) {
  return (
    <>
      <Head material={look.head} outline={look.outline} />
      <CatEar side={-1} look={look} />
      <CatEar side={1} look={look} />
    </>
  );
}

// Mars: an octopus whose six tentacles sway
function Octopus({ look }) {
  const tentacles = useRef([]);
  useFrame((state) => {
    tentacles.current.forEach((tentacle, i) => {
      if (tentacle) tentacle.rotation.z = 0.12 * Math.sin(state.clock.elapsedTime * 2.2 + i * 1.3);
    });
  });
  return (
    <>
      <Head material={look.body} outline={look.outline} />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} rotation={[0, Math.PI / 6 + (i * Math.PI) / 3, 0]}>
          <group ref={(tentacle) => { tentacles.current[i] = tentacle; }}>
            <mesh geometry={tentacleGeometry} material={look.tentacle} />
            <mesh geometry={tentacleGeometry} material={look.outline} />
          </group>
        </group>
      ))}
    </>
  );
}

function Flower({ look }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 5;
        return <mesh key={i} geometry={petalGeometry} material={look.petal} position={[Math.cos(angle) * 0.11, Math.sin(angle) * 0.11, 0]} scale={[1, 1, 0.5]} />;
      })}
      <mesh geometry={petalGeometry} material={look.flowerHeart} position={[0, 0, 0.04]} scale={0.6} />
    </>
  );
}

// Saturn: its ring becomes the brim of a straw hat, pushed back like a cowboy's,
// so that the face shows under the brim even seen from above
function StrawHat({ look }) {
  const flowerAngle = -0.6;
  return (
    <>
      <Head material={look.body} outline={look.outline} />
      <group rotation={[-0.7, 0, -0.15]}>
        <group scale={[1, 1.15, 1]}>
          <mesh geometry={crownGeometry} material={look.crown} />
          <mesh geometry={crownGeometry} material={look.outline} />
        </group>
        <mesh geometry={ribbonGeometry} material={look.ribbon} position={[0, 0.12, 0]} />
        <mesh geometry={brimGeometry} material={look.brim} rotation={[-Math.PI / 2, 0, 0]} />
        <group position={[1.07 * Math.sin(flowerAngle), 0.14, 1.07 * Math.cos(flowerAngle)]} rotation={[0, flowerAngle, 0]}>
          <Flower look={look} />
        </group>
      </group>
    </>
  );
}

// Uranus: asleep in a striped nightcap. It lies on its side, the cap on its axis, and rolls as it spins.
function Sleeper({ look }) {
  return (
    <>
      <Head material={look.body} outline={look.outline} />
      <mesh geometry={nightcapGeometry} material={look.cap} />
      <mesh geometry={nightcapGeometry} material={look.outline} />
      <mesh geometry={capBandGeometry} material={look.capBand} position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={pompomGeometry} material={look.capBand} position={nightcapTip} />
      <mesh geometry={pompomGeometry} material={look.outline} position={nightcapTip} />
    </>
  );
}

// "Z"s floating up from the sleeper, always facing the player (outside its tilt and spin)
function SleepZs({ radius, look }) {
  const letters = useRef([]);
  useFrame((state) => {
    letters.current.forEach((letter, i) => {
      if (!letter) return;
      const t = (state.clock.elapsedTime * 0.35 + i / 3) % 1;
      letter.position.set(radius * (0.8 + t * 0.6), radius * (0.8 + t * 1.1), 0);
      letter.scale.setScalar(radius * (0.25 + t * 0.25));
      letter.lookAt(state.camera.position);
    });
  });
  return [0, 1, 2].map((i) => (
    <mesh key={i} ref={(letter) => { letters.current[i] = letter; }} geometry={sleepZGeometry} material={look.sleepZ} />
  ));
}

// Neptune: a pufferfish, bristling with spines, that puffs up and down
function Pufferfish({ look }) {
  const body = useRef();
  useFrame((state) => {
    body.current.scale.setScalar(1 + 0.05 * Math.sin(state.clock.elapsedTime * 3));
  });
  return (
    <group ref={body}>
      <Head material={look.body} outline={look.outline} />
      <mesh geometry={spikesGeometry} material={look.spikes} />
      <mesh geometry={spikesGeometry} material={look.outline} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.0, -0.15, 0.2]} rotation={[0, 0, side * 0.4]} scale={[0.12, 0.3, 0.22]}>
          <mesh geometry={finGeometry} material={look.fin} />
          <mesh geometry={finGeometry} material={look.outline} />
        </group>
      ))}
      <group position={[0, 0, -1.05]} scale={[0.08, 0.38, 0.3]}>
        <mesh geometry={finGeometry} material={look.fin} />
        <mesh geometry={finGeometry} material={look.outline} />
      </group>
    </group>
  );
}

const characters = { mercury: Onigiri, venus: Diva, earth: Diver, mars: Octopus, jupiter: Cat, saturn: StrawHat, uranus: Sleeper, neptune: Pufferfish };

// Uranus spins around an axis tilted by 98 degrees, as the real one does
const tilts = { uranus: [0, 0, THREE.MathUtils.degToRad(98)] };
const noTilt = [0, 0, 0];

// look: the materials made by createNekoCharacterLook for this planet
export function NekoPlanet({ name, radius, look, spinRef }) {
  const Character = characters[name];
  return (
    <>
      <group rotation={tilts[name] ?? noTilt}>
        <group ref={spinRef} scale={radius}>
          <Character look={look} />
        </group>
      </group>
      {name === 'uranus' && <SleepZs radius={radius} look={look} />}
    </>
  );
}

// The star always faces the player, as sprites do, swaying a little
export function NekoStar({ radius, look }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.lookAt(state.camera.position);
    ref.current.rotateZ(0.15 * Math.sin(state.clock.elapsedTime * 0.9));
  });
  return (
    <group ref={ref} scale={radius}>
      <mesh geometry={starGeometry} material={look.body} />
      <mesh geometry={starGeometry} material={look.outline} />
      <mesh geometry={starFaceGeometry} material={look.face} position={[0, 0.04, 0.4]} />
    </group>
  );
}
