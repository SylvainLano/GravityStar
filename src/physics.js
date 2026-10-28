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

const gravitationalConstant = 6.674 * Math.pow(10, -11); // Adjusted gravitational constant

// The star's mass by default (in Earth masses, as the Sun's), for which the planets' orbits are set
export const sunMass = 333000;

// How strongly the star must pull a body, compared with its gravity, to hold it on a circle of this radius at this speed
// (per 60 fps step). The planets' distances are squeezed to fit on the screen while their years keep their real
// proportions, which the star's gravity alone could not hold: each planet feels it with its own strength.
export function starPullFor(radius, speed) {
  return (speed * speed * radius) / (gravitationalConstant * sunMass);
}

export function calculateGravitationalForce(objetMass, position, objectPosition, target = new THREE.Vector3()) {
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

// The orbit of a body around the star (at the origin), from its position and its velocity (per 60 fps step), under
// the star's gravity alone: its distance and speed now, the time of a turn (in steps, null when it never comes back),
// its eccentricity (0 for a circle, towards 1 for a very stretched ellipse, 1 or more when it leaves), its mean
// distance (semiMajorAxis), how close to the star it will pass, and whether it turns the other way round.
// starMass: the mass the body feels (for a planet, multiplied by its starPull).
const angularMomentum = new THREE.Vector3();
export function describeOrbit(position, velocity, starMass) {
  const distance = position.length();
  const speed = velocity.length();
  // The planets start turning with their angular momentum pointing up
  const retrograde = angularMomentum.crossVectors(position, velocity).y < 0;
  const mu = gravitationalConstant * starMass;
  if (mu <= 0) {
    // A star without mass, or pushing away: nothing comes back
    return { distance, speed, period: null, eccentricity: Infinity, semiMajorAxis: Infinity, closest: distance, escaping: true, retrograde };
  }
  const energy = (speed * speed) / 2 - mu / distance;
  const h2 = angularMomentum.lengthSq();
  const eccentricity = Math.sqrt(Math.max(0, 1 + (2 * energy * h2) / (mu * mu)));
  const closest = h2 / (mu * (1 + eccentricity));
  if (energy >= 0) {
    return { distance, speed, period: null, eccentricity, semiMajorAxis: Infinity, closest, escaping: true, retrograde };
  }
  const semiMajorAxis = -mu / (2 * energy);
  return { distance, speed, period: 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / mu), eccentricity, semiMajorAxis, closest, escaping: false, retrograde };
}

// Reused by every prediction, to avoid creating new objects on every frame
const predicted = { position: new THREE.Vector3(), velocity: new THREE.Vector3(), force: new THREE.Vector3() };
const predictedPlanets = Array.from({ length: 16 }, () => ({ position: new THREE.Vector3(), velocity: new THREE.Vector3(), wait: 0 }));

// Predicts the path of an asteroid thrown from origin at velocity, moving as the asteroids do (see Asteroid.jsx),
// for at most maxSteps steps of 60 fps. Meanwhile the planets move around the star, each with its own pull (starPull).
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
      planet.velocity.addScaledVector(calculateGravitationalForce(starMass, planet.position, starPosition, predicted.force), planets[i].starPull);
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
