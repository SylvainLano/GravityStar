import * as THREE from 'three';

// The simulation moves objects by one step per frame, as it was written for 60 frames per second.
// frameScale converts the time elapsed since the last frame into a number of such steps,
// so that the game runs at the same speed whatever the screen's refresh rate.
// Long pauses (a hidden tab, a hiccup) count as 3 steps at most, so that nothing jumps or passes through another object.
const referenceFrameRate = 60;
const maxStepsPerFrame = 3;

export function frameScale(delta) {
  return Math.min(delta * referenceFrameRate, maxStepsPerFrame);
}

// Two asteroids closer than this collide
export const asteroidCollisionDistance = 0.15;

export function calculateGravitationalForce(objetMass, position, objectPosition, target = new THREE.Vector3()) {
  const gravitationalConstant = 6.674 * Math.pow(10, -11); // Adjusted gravitational constant

  // Calculate the vector from the planet to the star (sun)
  const distanceVector = target; // Written into target, so callers can reuse a vector instead of creating one on every frame
  distanceVector.subVectors(position, objectPosition); // Assuming the star is at the origin

  // Calculate the magnitude of the force
  const distanceSquared = distanceVector.lengthSq();
  const forceMagnitude = (gravitationalConstant * objetMass) / distanceSquared;

  // Calculate the force vector (directional)
  const forceVector = distanceVector.normalize().multiplyScalar(-forceMagnitude);

  return forceVector;
}

// Reused by every prediction, to avoid creating new objects on every frame
const predicted = { position: new THREE.Vector3(), velocity: new THREE.Vector3(), force: new THREE.Vector3() };
const predictedPlanets = Array.from({ length: 16 }, () => ({ position: new THREE.Vector3(), velocity: new THREE.Vector3(), wait: 0 }));

// Predicts the path of an asteroid thrown from origin at velocity, moving as the asteroids do (see Asteroid.jsx),
// for at most maxSteps steps of 60 fps. Meanwhile the planets move around the star (leaving out their pull on each other).
// Writes one point every `every` steps into points (a Float32Array of x, y, z), until it is full,
// and returns how many points were written and whether the path ends on the star or a planet.
export function predictTrajectory({ origin, velocity, planets, starPosition, starMass, starSize, asteroidGravityFactor, planetGravityFactor, planetSizeFactor, maxSteps, every, points }) {
  const position = predicted.position.copy(origin);
  const speed = predicted.velocity.copy(velocity);
  const planetCount = Math.min(planets.length, predictedPlanets.length);
  for (let i = 0; i < planetCount; i++) {
    predictedPlanets[i].position.copy(planets[i].position);
    predictedPlanets[i].velocity.copy(planets[i].velocity);
    predictedPlanets[i].wait = 0;
  }

  let count = 0;
  let hit = false;
  for (let step = 1; step <= maxSteps && !hit; step++) {
    // The planets follow their orbits
    for (let i = 0; i < planetCount; i++) {
      const planet = predictedPlanets[i];
      planet.velocity.add(calculateGravitationalForce(starMass, planet.position, starPosition, predicted.force));
      planet.position.add(planet.velocity);
    }

    // The asteroid moves, then the star pulls it
    position.add(speed);
    const distanceToStar = position.distanceTo(starPosition);
    if (distanceToStar > 0) speed.addScaledVector(calculateGravitationalForce(starMass, position, starPosition, predicted.force), asteroidGravityFactor);

    if (distanceToStar <= starSize) {
      hit = true;
    } else {
      // The planets pull it, at the same pace as in the game, unless it hits one of them
      for (let i = 0; i < planetCount; i++) {
        const planet = predictedPlanets[i];
        planet.wait -= 1;
        if (planet.wait > 0) continue;
        const distance = position.distanceTo(planet.position);
        if (distance < 0.1 + planets[i].size * planetSizeFactor) {
          hit = true;
          break;
        }
        const force = calculateGravitationalForce(planets[i].mass, position, planet.position, predicted.force);
        speed.add(force.multiplyScalar(asteroidGravityFactor * planetGravityFactor));
        let wait = Math.max(1, Math.round(distance / (speed.length() + planet.velocity.length())));
        if (force.length() * asteroidGravityFactor * planetGravityFactor > 0.0001) wait = Math.max(1, Math.round(wait / planetGravityFactor));
        planet.wait = wait;
      }
    }

    if (hit || step % every === 0) {
      points[count * 3] = position.x;
      points[count * 3 + 1] = position.y;
      points[count * 3 + 2] = position.z;
      count++;
      if (count * 3 >= points.length) break;
    }
    // Far beyond Neptune, nothing more to see
    if (position.lengthSq() > 2500) break;
  }
  return { count, hit };
}
