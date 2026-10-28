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
