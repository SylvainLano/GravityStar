import { createContext, useContext } from 'react';
import { useFrame } from '@react-three/fiber';

import { frameScale } from './physics';

// The clock of the simulation, which the speed setting slows down, speeds up or pauses.
// On each frame it holds:
//   steps: the number of 60 fps steps to simulate (0 when paused)
//   substeps and stepSize: the same steps, cut into substeps of at most one step each,
//     so that the bodies follow the same paths and meet the same collisions at any speed
//   time: the simulated time in milliseconds, for what lasts a given time (explosions)
export const SimulationContext = createContext(null);

export function createSimulation() {
  return { steps: 0, substeps: 0, stepSize: 0, time: 0 };
}

// The simulation's clock, as a ref read on each frame
export function useSimulation() {
  return useContext(SimulationContext);
}

// Advances the clock on each frame, before every other object moves.
// speed: 2 is the normal speed, 1 half of it, 0 the pause.
export function SimulationClock({ simulation, speed }) {
  useFrame((state, delta) => {
    const clock = simulation.current;
    clock.steps = frameScale(delta) * speed / 2;
    clock.substeps = Math.ceil(clock.steps - 1e-6);
    clock.stepSize = clock.substeps > 0 ? clock.steps / clock.substeps : 0;
    clock.time += clock.steps * 1000 / 60;
  }, -1); // A negative priority runs before the other frame callbacks, without taking over the rendering

  return null;
}
