import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Star = ({ size, starIntensity }) => {
  const starRef = useRef();
  const [starMaterial, setStarMaterial] = useState(
    new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Yellow color
  );

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/img/2k_sun.jpg',
      (texture) => {
        texture = adjustBrightness(texture, starIntensity/5); // Divide by 5 for the texture not to burn too fast
        // Create a new material with the loaded texture
        const material = new THREE.MeshBasicMaterial({ map: texture });
        setStarMaterial(material);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
  }, [starIntensity]);

  // Function to adjust texture brightness
  const adjustBrightness = (texture, brightness) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    context.drawImage(texture.image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] *= brightness; // Adjust the red channel
      data[i + 1] *= brightness; // Adjust the green channel
      data[i + 2] *= brightness; // Adjust the blue channel
    }

    context.putImageData(imageData, 0, 0);
    texture.image = canvas;
    texture.needsUpdate = true;

    return texture;
  };

  useFrame(() => {
    // Rotate the star
    starRef.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={starRef} position={[0, 0, 0]} material={starMaterial}>
      <sphereGeometry args={[size, 64, 64]} />
    </mesh>
  );
};

export default Star;
