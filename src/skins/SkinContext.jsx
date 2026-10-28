import React, { createContext, useContext, useLayoutEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';

import { findSkin } from './skins';
import { createSharedUniforms } from './styleMaterials';

const SkinContext = createContext(null);

// Gives the current skin to the scene, with the uniforms shared by the stylized materials and the looks already created.
// lightPosition is where the star is and starIntensity its luminosity (5 is the normal light),
// spotPosition and spotRange the spotlight at the camera that shows the asteroids before they are launched.
export function SkinProvider({ skinId, lightPosition, starIntensity, spotPosition, spotRange, children }) {
  const skin = findSkin(skinId);
  const shared = useMemo(createSharedUniforms, []);
  // Looks of every style already used, kept for when the player comes back to it
  const looks = useMemo(() => new Map(), []);

  useLayoutEffect(() => {
    shared.lightPosition.value.copy(lightPosition);
    shared.spotPosition.value.copy(spotPosition);
    shared.spotRange.value = spotRange;
    shared.starLight.value = starIntensity / 5;
  }, [shared, lightPosition, starIntensity, spotPosition, spotRange]);

  // Screen-space effects (outlines, hatching, screentone, paper grain) keep the same size whatever the pixel ratio
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  useLayoutEffect(() => {
    shared.pixelRatio.value = dpr;
    shared.resolution.value.set(size.width * dpr, size.height * dpr);
  }, [shared, size, dpr]);

  const value = useMemo(() => ({ skin, shared, looks }), [skin, shared, looks]);
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

// The current skin, as listed in skins.js
export function useSkin() {
  return useContext(SkinContext).skin;
}

// The look of an element in the style of the current skin, made by create(style, shared) the first time it is needed.
// key names the element (e.g. 'planet:earth'). Returns null for the realistic skin, which keeps the original materials.
export function useStyleLook(key, create) {
  const { skin, shared, looks } = useContext(SkinContext);
  if (!skin.style) return null;
  const id = `${skin.style}:${key}`;
  if (!looks.has(id)) looks.set(id, create(skin.style, shared));
  return looks.get(id);
}
