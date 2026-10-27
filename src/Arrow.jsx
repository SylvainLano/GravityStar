import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Arrow = ({ position, direction, length }) => {
  const arrowRef = useRef();

  // Calculate the rotation matrix to point the arrow in the specified direction
  const rotationMatrix = useMemo(() => {
    const matrix = new THREE.Matrix4();
    matrix.lookAt(position, direction, direction); // Use (0, 1, 0) as the up vector
    return matrix;
  }, [direction]);

  // Calculate the position offset to move the arrow ahead of its origin and not overlap the asteroid
  const positionOffset = useMemo(() => {
    const offset = new THREE.Vector3().copy(direction).normalize().multiplyScalar(length * 5 / 8);
    return offset;
  }, [direction, length]);

  useFrame(() => {
    // Update the arrow's position and apply the position offset
    arrowRef.current.position.copy(position).add(positionOffset);
    // Apply the rotation matrix to point the arrow in the specified direction
    arrowRef.current.quaternion.setFromRotationMatrix(rotationMatrix);
  });

  return (
    <mesh ref={arrowRef}>
      <coneGeometry args={[0.01, length, 8]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

export default Arrow;
