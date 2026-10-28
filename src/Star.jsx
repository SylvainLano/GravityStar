import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import { frameScale } from './physics';

const Star = ({ size, starIntensity }) => {
  const starRef = useRef();
  const texture = useLoader(THREE.TextureLoader, './img/2k_sun.jpg');

  // The material is created here rather than in JSX, so that the texture keeps the colors it always had
  // (R3F converts the textures given to materials as props to sRGB, which would change the sun's colors)
  const starMaterial = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ map: texture });
    // Colors brightened beyond white are cut, as when the brightness was applied to the texture's pixels
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        '#include <map_fragment>\n\tdiffuseColor.rgb = min( diffuseColor.rgb, vec3( 1.0 ) );'
      );
    };
    return material;
  }, [texture]);

  // Adjust the brightness with the material's color, instead of reloading and recalculating the texture
  useLayoutEffect(() => {
    starMaterial.color.setScalar(starIntensity/5); // Divide by 5 for the texture not to burn too fast
  }, [starMaterial, starIntensity]);

  useFrame((state, delta) => {
    // Rotate the star (by 0.001 per 60 fps step)
    starRef.current.rotation.y += 0.001 * frameScale(delta);
  });

  return (
    <mesh ref={starRef} position={[0, 0, 0]} material={starMaterial}>
      <sphereGeometry args={[size, 64, 64]} />
    </mesh>
  );
};

export default Star;
