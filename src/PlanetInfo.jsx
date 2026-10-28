import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { describeOrbit, sunMass } from './physics';
import { realPlanets } from './realPlanets';
import { useSimulation } from './SimulationClock';
import { planetColors } from './skins/looks';

// The panel is refreshed a few times per second, rather than on every frame
const refreshEvery = 250; // ms
// For this long after an impact, the planet is having a bad day
const badDayLength = 3000; // ms of game time

const number = (value) => String(Number(value.toPrecision(3)));
const realYear = (days) => (days < 1000 ? `${number(days)} days` : `${number(days / 365.25)} years`);
// A turn in the game, in seconds at the normal speed (60 steps per second)
const gameTime = (steps) => {
  if (steps === null) return 'never';
  const seconds = steps / 60;
  if (seconds < 100) return `${Math.round(seconds)} s`;
  if (seconds < 6000) return `${Math.round(seconds / 60)} min`;
  return `${number(seconds / 3600)} h`;
};
const shape = (eccentricity) => {
  if (eccentricity < 0.05) return 'round';
  if (eccentricity < 0.2) return 'slightly oval';
  if (eccentricity < 0.5) return 'oval';
  if (eccentricity < 1) return 'very stretched';
  return 'open';
};

// What the planet is going through, in a few words (the first that applies)
function statusOf(planet, orbit, time, starSize, starMass) {
  const inward = planet.position.dot(planet.velocity) < 0;
  if (time - planet.lastImpact < badDayLength) return 'Having a bad day';
  if (orbit.closest < starSize && (inward || !orbit.escaping)) return 'Working on its tan';
  if (orbit.escaping) return 'Going on a long vacation';
  if (orbit.retrograde) return 'Driving the wrong way';
  if (planet.impacts >= 5) return 'Seriously considering therapy';
  if (orbit.eccentricity > 0.5) return 'Taking the scenic route';
  if (orbit.semiMajorAxis > 1.5 * planet.start.distance) return 'Moved to the suburbs';
  if (orbit.semiMajorAxis < 0.67 * planet.start.distance) return 'Feeling the heat';
  if (planet.impacts >= 2) return 'Starting to take it personally';
  if (planet.impacts === 1) return 'A bit shaken, nothing serious';
  if (starMass !== sunMass) return "Coping with the star's mood swings";
  return 'Minding its own business';
}

// Reused on every refresh, to avoid creating new objects
const onScreen = new THREE.Vector3();

// The panel of the planet under the mouse, next to it: its real values, and those of the game, at the start and now
// (the game's distances are in units of the scene, its times in seconds at the normal speed)
function PlanetInfo({ planet, starMass, starSize }) {
  const group = useRef();
  const camera = useThree((state) => state.camera);
  const simulation = useSimulation();
  const [, refresh] = useState(0);
  const sinceRefresh = useRef(0);

  useFrame((state, delta) => {
    group.current.position.copy(planet.position);
    sinceRefresh.current += delta * 1000;
    if (sinceRefresh.current >= refreshEvery) {
      sinceRefresh.current = 0;
      refresh((count) => count + 1);
    }
  });

  const real = realPlanets[planet.name];
  // Each planet feels the star with its own strength (see starPull in StarScene.jsx)
  const orbit = describeOrbit(planet.position, planet.velocity, starMass * planet.starPull);
  const start = planet.start;
  const startPeriod = (2 * Math.PI * start.distance) / start.speed;
  // On the left of the planet when it is on the right of the screen, so that the panel stays in view
  const side = onScreen.copy(planet.position).project(camera).x > 0.2 ? 'left' : 'right';

  const rows = [
    ['Distance', `${number(real.distance)} AU`, `${number(start.distance)} → ${number(orbit.distance)}`],
    ['Year', realYear(real.year), `${gameTime(startPeriod)} → ${gameTime(orbit.period)}`],
    ['Speed', `${number(real.speed)} km/s`, `${number(start.speed * 60)} → ${number(orbit.speed * 60)}`],
    ['Orbit', shape(real.eccentricity), `round → ${shape(orbit.eccentricity)}`],
    ['Mass', `${number(real.mass)} × Earth`, number(planet.mass)],
    ['Impacts', '', String(planet.impacts)],
  ];

  return (
    <group ref={group}>
      {/* Under the settings and the skins (z-index 0, earlier in the page), and never in the way of the pointer */}
      <Html zIndexRange={[0, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`planet-info ${side}`}>
          <div className="planet-info-name">
            <span className="planet-info-dot" style={{ backgroundColor: planetColors[planet.name] }} />
            {planet.name}
          </div>
          <div className="planet-info-status">{statusOf(planet, orbit, simulation.current.time, starSize, starMass)}</div>
          <table>
            <thead>
              <tr><th /><th>Real</th><th>Game</th></tr>
            </thead>
            <tbody>
              {rows.map(([label, realValue, gameValue]) => (
                <tr key={label}><th>{label}</th><td>{realValue}</td><td>{gameValue}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="planet-info-note">Game: at start → now, in scene units and seconds</div>
        </div>
      </Html>
    </group>
  );
}

export default PlanetInfo;
