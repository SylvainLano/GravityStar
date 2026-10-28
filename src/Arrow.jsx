import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useSkin } from './skins/SkinContext';

// Reused on every frame, to avoid creating new objects
const coneAxis = new THREE.Vector3(0, 1, 0);
const direction = new THREE.Vector3();

// The arrow reads the aim directly on every frame, so moving the pointer never re-renders React components
// referenceDistance is the distance from the camera at which the arrow has its original thickness
const Arrow = ({ aim, referenceDistance }) => {
  const arrowRef = useRef();
  const skin = useSkin();

  useFrame(({ camera }) => {
    const arrow = arrowRef.current;
    const { active, origin, velocity } = aim.current;
    const length = velocity.length() * 100;
    arrow.visible = active && length > 0;
    if (!arrow.visible) return;

    // Point the arrow in the launch direction
    direction.copy(velocity).normalize();
    arrow.quaternion.setFromUnitVectors(coneAxis, direction);

    // Stretch it to its length, keeping the same thickness on screen wherever the asteroid is
    const thickness = camera.position.distanceTo(origin) / referenceDistance;
    arrow.scale.set(thickness, length, thickness);

    // Move the arrow ahead of its origin to not overlap the asteroid
    arrow.position.copy(origin).addScaledVector(direction, length * 5 / 8);
  });

  return (
    // Drawn over the rest of the scene, as when it had its own canvas
    <mesh ref={arrowRef} visible={false} renderOrder={1}>
      <coneGeometry args={[0.01, 1, 8]} />
      <meshBasicMaterial color={skin.arrow ?? 'red'} depthTest={false} />
    </mesh>
  );
};

export default React.memo(Arrow);
