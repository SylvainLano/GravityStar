import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import { unlock } from './achievements';
import { describeOrbit } from './physics';
import { useSimulation } from './SimulationClock';

// The planets are checked a few times per second, rather than on every frame
const checkEvery = 500; // ms
// Beyond Neptune's orbit (17), a planet that will not come back has left the system
const farAway = 30;
// Game time without throwing anything (it does not run during the pause)
const zenLength = 10 * 60 * 1000; // ms

// Watches the game for the achievements that no single event gives (see achievements.js): a planet leaving the system
// or turning the wrong way round, no planet left, a long time without throwing anything.
// lastLaunch: a ref to the game time of the last throw.
export default function AchievementWatcher({ planets, starMass, lastLaunch }) {
  const simulation = useSimulation();
  const sinceCheck = useRef(0);

  useFrame((state, delta) => {
    sinceCheck.current += delta * 1000;
    if (sinceCheck.current < checkEvery) return;
    sinceCheck.current = 0;

    if (simulation.current.time - lastLaunch.current >= zenLength) unlock('zen');
    let gone = 0;
    for (const planet of planets) {
      const orbit = describeOrbit(planet.position, planet.velocity, starMass * planet.starPull);
      if (orbit.escaping && orbit.distance > farAway) {
        unlock('bon-voyage');
        gone++;
      } else if (orbit.retrograde) {
        unlock('wrong-way');
      }
    }
    // Fallen into the star (and removed) or gone away
    if (gone === planets.length) unlock('empty-nest');
  });

  return null;
}
