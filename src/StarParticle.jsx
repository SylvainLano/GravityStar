import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

import { useSimulation } from './SimulationClock';
import { useSkin } from './skins/SkinContext';

const StarParticle = ({ startPosition, starSize, starIntensity }) => {

    const particleRef = useRef();
    const simulation = useSimulation();
    const skin = useSkin();
    const maxDistance = useRef(starSize+0.01);
    const [direction] = useState(new THREE.Vector3(
      Math.random() * 0.001 - 0.0005,
      Math.random() * 0.001 - 0.0005,
      Math.random() * 0.001 - 0.0005
    ));

    const adjust = starIntensity/5;

    // Colors of the stylized skins, between which the particles' colors are picked (darker or brighter with the star)
    const palette = useMemo(() => skin.sunParticles?.map((hex) => new THREE.Color(hex)), [skin]);
    const pickColor = (color) => (palette
      ? color.lerpColors(palette[0], palette[1], Math.random()).multiplyScalar(adjust)
      : color.setRGB(adjust, Math.random()*adjust*0.8+0.2*adjust, 0.2*adjust));

    // Generate a random color for the particle (the next ones are set directly on the material)
    const [initialColor] = useState(() => pickColor(new THREE.Color()));

    useFrame(() => {
      // Move the particle directly (by direction per 60 fps step): going through React state would re-render it on every frame
      const position = particleRef.current.position;
      position.addScaledVector(direction, simulation.current.steps);

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
        pickColor(particleRef.current.material.color);
      }
    });

    return (
      <mesh position={startPosition} ref={particleRef}>
        <sphereGeometry args={[0.01, 16, 16]} />
        {/* The colors of the stylized skins are shown exactly, without the tone mapping of the renderer */}
        <meshBasicMaterial color={initialColor} toneMapped={!palette} />
      </mesh>
    );
}

export default StarParticle;
