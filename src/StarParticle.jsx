import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const StarParticle = ({ startPosition, starSize, starIntensity }) => {

    const particleRef = useRef();
    const maxDistance = useRef(starSize+0.01);
    const [direction] = useState(new THREE.Vector3(
      Math.random() * 0.001 - 0.0005,
      Math.random() * 0.001 - 0.0005,
      Math.random() * 0.001 - 0.0005
    ));

    const adjust = starIntensity/5;

    // Generate a random color for the particle (the next ones are set directly on the material)
    const [initialColor] = useState(new THREE.Color(adjust, Math.random()*adjust*0.8+0.2*adjust, 0.2*adjust));

    useFrame(() => {
      // Move the particle directly: going through React state would re-render it on every frame
      const position = particleRef.current.position;
      position.add(direction);

      if (position.distanceTo(startPosition) > maxDistance.current) {
        // Change the direction vector when the particle reaches the maximum distance
        direction.set(
          Math.random() * 0.001 - 0.0005,
          Math.random() * 0.001 - 0.0005,
          Math.random() * 0.001 - 0.0005
        );
        if ( Math.random() > 0.9 ) {
          maxDistance.current = starSize+0.1;
        } else {
          maxDistance.current = Math.random()*0.01+starSize+0.01;
        }
        position.copy(startPosition); // Set position back to the origin

        // Generate a new random color for the particle
        particleRef.current.material.color.setRGB(adjust, Math.random()*adjust*0.8+0.2*adjust, 0.2*adjust);
      }
    });

    return (
      <mesh position={startPosition} ref={particleRef}>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshBasicMaterial color={initialColor} />
      </mesh>
    );
}

export default StarParticle;
