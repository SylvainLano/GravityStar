import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const StarParticle = ({ startPosition, starSize, starIntensity }) => {
    
    const particleRef = useRef();
    const [position, setPosition] = useState(startPosition);
    const [maxDistance, setMaxDistance] = useState(starSize+0.01);
    const [direction] = useState(new THREE.Vector3(
      Math.random() * 0.001 - 0.0005,
      Math.random() * 0.001 - 0.0005,
      Math.random() * 0.001 - 0.0005
    ));

    const adjust = starIntensity/5;
    
    // Generate a random color for the particle
    const [randomColor, setRandomColor] = useState(new THREE.Color(adjust, Math.random()*adjust*0.8+0.2*adjust, 0.2*adjust));
  
    useFrame(() => {
      // Update the particle's position by adding the direction vector
      const newPosition = position.clone().add(direction);
      const origin = new THREE.Vector3(0, 0, 0);
      const distance = newPosition.distanceTo(origin);
  
      if (distance > maxDistance) {
        // Change the direction vector when the particle reaches the maximum distance
        const newDirection = new THREE.Vector3(
          Math.random() * 0.001 - 0.0005,
          Math.random() * 0.001 - 0.0005,
          Math.random() * 0.001 - 0.0005
        );
        if ( Math.random() > 0.9 ) {
          setMaxDistance(starSize+0.1);
        } else {
          setMaxDistance(Math.random()*0.01+starSize+0.01);
        }
        setPosition(origin); // Set position back to the origin
        direction.copy(newDirection); // Update the direction
        
        // Generate a new random color for the particle
        setRandomColor(new THREE.Color(adjust, Math.random()*adjust*0.8+0.2*adjust, 0.2*adjust));
      } else {
        setPosition(newPosition);
      }
    });
  
    return (
      <mesh position={position} ref={particleRef}>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshBasicMaterial color={randomColor} />
      </mesh>
    );
}

export default StarParticle;