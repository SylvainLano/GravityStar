import { useFrame } from '@react-three/fiber';

import { useSimulation } from '../SimulationClock';
import { setSoundPaused, updateSpheres } from './sound';

// Brings the held sounds of the realistic skin (the music of the spheres) up to date on each frame,
// and fades them out while the game is paused
export default function SoundBridge({ planets, asteroids }) {
  const simulation = useSimulation();
  useFrame(({ camera }) => {
    setSoundPaused(simulation.current.steps === 0);
    updateSpheres(planets, asteroids, camera.position);
  });
  return null;
}
