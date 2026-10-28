import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

import { frameScale } from './physics';
import { useStyleLook } from './skins/SkinContext';
import { createSunLook } from './skins/looks';
import { NekoStar } from './skins/NekoNebulaCharacters';

const Star = ({ size, starIntensity }) => {
  const starRef = useRef();
  const texture = useLoader(THREE.TextureLoader, './img/2k_sun.jpg');
  // Materials of the stylized skins (null for the realistic one)
  const look = useStyleLook('sun', (style, shared) => createSunLook(style, { shared, map: texture }));

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
    // Rotate the star (by 0.001 per 60 fps step), unless it is a character, which moves by itself
    if (starRef.current) starRef.current.rotation.y += 0.001 * frameScale(delta);
  });

  if (look?.character) return <NekoStar radius={size} look={look.character} />;

  return (
    <group>
      <mesh ref={starRef} position={[0, 0, 0]} material={look ? look.material : starMaterial}>
        <sphereGeometry args={[size, 64, 64]} />
        {look?.outline && (
          <mesh material={look.outline}>
            <sphereGeometry args={[size, 64, 64]} />
          </mesh>
        )}
      </mesh>
      {/* Glow of the pastel and anime skins, always facing the camera */}
      {look?.halo && (
        <Billboard>
          <mesh material={look.halo}>
            <planeGeometry args={[size * look.haloSize, size * look.haloSize]} />
          </mesh>
        </Billboard>
      )}
    </group>
  );
};

export default Star;
