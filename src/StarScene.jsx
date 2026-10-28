import { useRef, useMemo, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import Asteroid from './Asteroid';
import StarParticle from './StarParticle';
import Star from './Star';
import TwinklingStar from './TwinklingStar';
import Arrow from './Arrow';
import Planet from './Planet';
import Explosion from './Explosion';

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

// Keep loaded files in memory (the sun texture is reloaded when its luminosity changes)
THREE.Cache.enabled = true;

// Setting up const and function common to both the MouseEventsHandler and the main StarScene
const starPosition = new THREE.Vector3(0, 0, 0);
const cameraPosition = new THREE.Vector3(0, 5, 6);
// Calculate the position to spawn asteroids between the camera and the star
const asteroidStartingPosition = new THREE.Vector3().copy(cameraPosition).lerp(starPosition, 0.25);
asteroidStartingPosition.y -= 0.5;
// Scaling the force with which launching the asteroids
const lateralVelocityScale = 0.02;
// Scaling the momentum toward the star for the launch
const momentumScale = 0.0005;
// Method to calculate the deviation from the origin point being the position of the asteroid before launch
function calculateLateralVelocity(mousePosition, momentum) {
  // Calculate the lateral position by subtracting the asteroidStartingPosition from the mousePosition
  const lateralPosition = mousePosition.clone().sub(asteroidStartingPosition);

  // Calculate the direction from asteroidStartingPosition to starPosition
  const directionToStar = starPosition.clone().sub(asteroidStartingPosition);

  // Calculate the projection of lateralVelocity onto directionToStar
  const projection = lateralPosition.clone().projectOnVector(directionToStar);

  // Subtract the projection from lateralVelocity to get purely lateral velocity
  const lateralVelocityWithoutStarComponent = lateralPosition.clone().sub(projection);

  // Calculate the lateral velocity based on lateralPosition
  const lateralVelocity = lateralVelocityWithoutStarComponent.multiplyScalar(lateralVelocityScale);
  
  if ( momentum ) {
    // Add a small momentum towards the star
    const momentumTowardsStar = directionToStar.clone().multiplyScalar(momentumScale);
    lateralVelocity.add(momentumTowardsStar);
  }

  return lateralVelocity;
}
// Method to handle the display of the launching arrow only
// This is to avoid React from comparing the whole scene on every mouse movement
// If this was included within StarScene (like I did in the beginning), it would cause great performances issues
function MouseEventsHandler({ children }) {
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [arrowDirection, setArrowDirection] = useState(starPosition);
  const [arrowLength, setArrowLength] = useState(0);

  const handleMouseMove = (e) => {
    if (mouseIsPressed) {
      const mousePosition = new THREE.Vector3(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0
      );

      const lateralVelocity = calculateLateralVelocity(mousePosition, false);

      // Calculate arrow direction based on asteroid's velocity
      setArrowDirection(lateralVelocity.clone());
      setArrowLength(lateralVelocity.length() * 100);
    }
  };    

  const handleMouseDown = () => {
    setMouseIsPressed(true);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
    >
      

      {/* Main Canvas */}
      {children}
      
      {/* Overlay Canvas */}
      <Canvas
        camera={{ position: cameraPosition }}
        gl={{ antialias: true }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none', // Prevent interactions with the overlay canvas
        }}
      >
        {/* Render the arrow when mouse is pressed */}
        {mouseIsPressed && <Arrow
            position={asteroidStartingPosition}
            direction={arrowDirection}
            length={arrowLength}
          />}
      </Canvas>
    </div>
  );
}

function StarScene({starSize, planetSizeFactor, starMass, asteroidMass, asteroidGravityFactor, planetGravityFactor, starIntensity}) {
  
  const sceneRef = useRef();

  const [explosions, setExplosions] = useState([]);
  const [nextKey, setNextKey] = useState(0);

  /* Creating a set of Planets 
      velocity is 10 divided by a hundred times the square root of days around the sun
      size is the square root of diameter divided by 2000
      distance is choosen in order to see all planets on the scene (close to AU*8/10 for inner planets)
      rotation is 0.01 divided by the number of earth days for the planet to rotate on itself
      mass is the ratio to earth mass */
  const [planets, setPlanets] = useState([
    {
      index: 1,
      name: "mercury",
      size: 0.0349,
      position: new THREE.Vector3((0.8+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 938)),
      rotation: { x: 0, y: 0.00017, z: 0 },
      planetTexture: './img/2k_mercury.jpg',
      mass: 0.055,
      shouldCorrectOrbit: true
    },
    {
      index: 2,
      name: "venus",
      size: 0.055,
      position: new THREE.Vector3((1.44+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 1559)),
      rotation: { x: 0, y: 0.000041, z: 0 },
      planetTexture: './img/2k_venus_atmosphere.jpg',
      mass: 0.815,
      shouldCorrectOrbit: true
    },
    {
      index: 3,
      name: "earth",
      size: 0.05644,
      position: new THREE.Vector3((2+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 1910)),
      rotation: { x: 0, y: 0.01, z: 0 },
      planetTexture: './img/2k_earth_daymap.jpg',
      mass: 1,
      shouldCorrectOrbit: true
    },
    {
      index: 4,
      name: "mars",
      size: 0.0412,
      position: new THREE.Vector3((3.04+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 2621)),
      rotation: { x: 0, y: 0.01, z: 0 },
      planetTexture: './img/2k_mars.jpg',
      mass: 0.107,
      shouldCorrectOrbit: true
    },
    {
      index: 5,
      name: "jupiter",
      size: 0.1889,
      position: new THREE.Vector3((6.2+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 6583)),
      rotation: { x: 0, y: 0.024, z: 0 },
      planetTexture: './img/2k_jupiter.jpg',
      mass: 316,
      shouldCorrectOrbit: true
    },
    {
      index: 6,
      name: "saturn",
      size: 0.1706,
      position: new THREE.Vector3((9.5+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 10373)),
      rotation: { x: 0, y: 0.0229, z: 0 },
      planetTexture: './img/2k_saturn.jpg',
      mass: 95,
      shouldCorrectOrbit: true
    },
    {
      index: 7,
      name: "uranus",
      size: 0.1126,
      position: new THREE.Vector3((13+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 17517)),
      rotation: { x: 0, y: 0.0141, z: 0 },
      planetTexture: './img/2k_uranus.jpg',
      mass: 14.53,
      shouldCorrectOrbit: true
    },
    {
      index: 8,
      name: "neptune",
      size: 0.1105,
      position: new THREE.Vector3((17+starSize), 0, 0),
      velocity: new THREE.Vector3(0, 0, -(10 / 24500)),
      rotation: { x: 0, y: 0.015, z: 0 },
      planetTexture: './img/2k_neptune.jpg',
      mass: 17.15,
      shouldCorrectOrbit: true
    }
  ]);

  // Create a spotlight where the camera is to see the asteroids to be launched
  // (created once: a new light on every render made React replace it each time)
  const spotlight = useMemo(() => {
    const light = new THREE.SpotLight(0xffffff); // Set the light color
    light.position.copy(cameraPosition); // Set the light position
    // 15 with physical lights matches the former intensity of 4 with three.js' legacy lights
    light.intensity = 15;
    // Set spotlight parameters
    light.distance = 4; // Adjust the light's distance
    light.angle = Math.PI / 3; // Set the cone angle (adjust as needed)
    light.penumbra = 2; // Set the penumbra (adjust as needed)
    light.target.position.copy(starPosition);
    return light;
  }, []);

  // Creating the stars in the background
  const numStars = 200;
  const stars = useMemo(() => {
    const starsArray = [];
    const distanceFromStar = 2 * Math.sqrt(
      Math.pow(starPosition.x - cameraPosition.x, 2) +
      Math.pow(starPosition.y - cameraPosition.y, 2) +
      Math.pow(starPosition.z - cameraPosition.z, 2)
    ); // Adjust the distance as needed
  
    for (let i = 0; i < numStars; i++) {
      const polarAngle = Math.random() * Math.PI * 2; // Random angle in spherical coordinates
      const inclinationAngle = (Math.random() - 0.5) * Math.PI; // Random inclination angle
      const x = starPosition.x + distanceFromStar * Math.cos(polarAngle) * Math.cos(inclinationAngle);
      const y = starPosition.y + distanceFromStar * Math.sin(polarAngle) * Math.cos(inclinationAngle);
      const z = starPosition.z + distanceFromStar * Math.sin(inclinationAngle);
  
      const radius = Math.random() * 0.006 + 0.01;
      starsArray.push(<TwinklingStar key={i} position={[x, y, z]} radius={radius} />);
    }
    return starsArray;
  }, []);
  
  // Creating the particles emanating from the star
  const numParticles = 100;
  const starParticles = useMemo(() => {
    const particlesArray = [];
    for (let i = 0; i < numParticles; i++) {
      particlesArray.push(<StarParticle key={i} startPosition={starPosition} starSize={starSize} starIntensity={starIntensity} />);
    }
    return particlesArray;
  }, [starSize, starIntensity]);

  // Lights shared by the explosions: they always stay in the scene and are switched off when unused,
  // because adding or removing a light makes three.js recompile every material (a short freeze at each explosion)
  const explosionLights = useMemo(() => Array.from({ length: 3 }, () => ({
    light: new THREE.PointLight(0xff8800, 0, 4, 0), // Color, Intensity, Distance, Decay
    owner: null,
    since: 0
  })), []);

  // Managing the asteroids to be launched
  const [asteroids, setAsteroids] = useState([]);
  const [activeAsteroidId, setActiveAsteroidId] = useState(null);

  const handleMouseDown = () => { 
    // Create a new asteroid at the calculated position
    const initialVelocity = new THREE.Vector3(0, 0, 0);
    const newAsteroid = {
      index: nextKey,
      position: asteroidStartingPosition.clone(),
      velocity: initialVelocity,
      angularVelocity: initialVelocity,
      active: true,
      moving: false
    };

    setNextKey((prevNextKey) => prevNextKey + 1);
    setActiveAsteroidId(newAsteroid.index);

    // Schedule the state update using requestAnimationFrame
    requestAnimationFrame(() => {
      setAsteroids((prevAsteroids) => [...prevAsteroids, newAsteroid]);
    });
  };
  
  const handleMouseUp = (e) => {
    if ( activeAsteroidId !== null ) {
      const asteroid = asteroids.find((asteroid) => asteroid.index === activeAsteroidId);
  
      if (!asteroid) {
        return; // No active asteroid found
      }

      const mouse3DPosition = new THREE.Vector3(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
        0
      );

      const lateralVelocity = calculateLateralVelocity(mouse3DPosition, true);
  
      setAsteroids((prevAsteroids) =>
        prevAsteroids.map((asteroid) => ({
          ...asteroid,
          moving: true,
          ...(asteroid.index === activeAsteroidId
            ? {
                velocity: lateralVelocity,
                angularVelocity: lateralVelocity,
              }
            : {}),
        }))
      );

      setActiveAsteroidId(null); // Unset the active asteroid's identifier
    }
  };

  const handleAsteroidToStarCollision = (collidedAsteroidIndex) => {
    // Update the state to remove the collided asteroid
    setAsteroids((prevAsteroids) => prevAsteroids.filter((asteroid) => asteroid.index !== collidedAsteroidIndex));
  };  

  const handleExplosionEnd = (endedExplosion) => {
    // Update the state to remove the collided asteroid
    setExplosions((prevExplosions) => prevExplosions.filter((explosion) => explosion.index !== endedExplosion));
  };

  const handleAsteroidToAsteroidCollision = useCallback((collidedAsteroid1, collidedAsteroid2, position) => {
    setExplosions((prevExplosions) => {
      const newExplosion = {
        index: nextKey,
        position: position,
        timestamp: Date.now()
      };
  
      // Increment nextKey atomically
      setNextKey((prevNextKey) => prevNextKey + 1);
  
      // Add the new explosion to the array
      return [...prevExplosions, newExplosion];
    });
  
    // Update the state to remove the collided asteroid
    setAsteroids((prevAsteroids) => prevAsteroids.filter((asteroid) => asteroid.index !== collidedAsteroid1 && asteroid.index !== collidedAsteroid2));
  }, [sceneRef, nextKey]);

  const handleAsteroidToPlanetCollision = useCallback((collidedAsteroid, collidedPlanet, position, momentumToAdd, angularMomentumToAdd) => {

    setExplosions((prevExplosions) => {
      const newExplosion = {
        index: nextKey,
        position: position,
        timestamp: Date.now()
      };
  
      // Increment nextKey atomically
      setNextKey((prevNextKey) => prevNextKey + 1);
  
      // Add the new explosion to the array
      return [...prevExplosions, newExplosion];
    });

    setPlanets((prevPlanets) =>
    prevPlanets.map((planet) => ({
        ...planet,
        ...(planet.index === collidedPlanet
          ? {
              velocity: planet.velocity.add(momentumToAdd),
              rotation: { x: planet.rotation.x + angularMomentumToAdd.x,
                  y: planet.rotation.y + angularMomentumToAdd.y,
                  z: planet.rotation.z + angularMomentumToAdd.z },
              shouldCorrectOrbit: false
            }
          : {}),
      }))
    );
  
    // Update the state to remove the collided asteroid
    setAsteroids((prevAsteroids) => prevAsteroids.filter((asteroid) => asteroid.index !== collidedAsteroid));

  }, [sceneRef, nextKey]);

  const handlePlanetToPlanetCollision = useCallback((collidedPlanet1, momentumToAdd1, collidedPlanet2, momentumToAdd2) => {

    setPlanets((prevPlanets) =>
      prevPlanets.map((planet) => {
        if (planet.index === collidedPlanet1) {
          return {
            ...planet,
            velocity: planet.velocity.clone().add(momentumToAdd1),
            shouldCorrectOrbit: false,
          };
        }
        if (planet.index === collidedPlanet2) {
          return {
            ...planet,
            velocity: planet.velocity.clone().add(momentumToAdd2),
            shouldCorrectOrbit: false,
          };
        }
        return planet; // Return the original planet object if no changes are needed
      })
    );
  
  }, [sceneRef]);

  const handlePlanetToStarCollision = (collidedPlanetIndex) => {
    // Update the state to remove the collided planet
    setPlanets((prevPlanets) => prevPlanets.filter((planet) => planet.index !== collidedPlanetIndex));
  };  

  useEffect(() => {
    // Use useEffect to respond to changes in starMass
    // Set shouldCorrectOrbit to false for every planet in the array
    let shouldCorrectOrbit = false;
    if ( starMass === 333000 ) {
      shouldCorrectOrbit = true;
    }
    setPlanets((prevPlanets) =>
      prevPlanets.map((planet) => ({
        ...planet,
        shouldCorrectOrbit: shouldCorrectOrbit
      }))
    );
  }, [starMass]);

  return (
    <MouseEventsHandler>
      <Canvas
        shadows
        camera={{ position: cameraPosition }}
        gl={{antialias: true}}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Set up the scene and camera */}
        <scene ref={sceneRef}>

          {/* Add the spotlight to the scene */}
          <primitive object={spotlight} />

          {/* Add the light coming from the star to illuminate the system
              Intensity, distance and decay are tuned for physical lights to match the former look of three.js' legacy lights
              (one light at the center lights the planets like the former ring of 20 lights, for a fraction of the cost) */}
          <pointLight position={starPosition} intensity={starIntensity * 3.6} distance={19} decay={0.75} />

          {/* Add the lights shared by the explosions */}
          {explosionLights.map((entry, i) => <primitive key={`explosion_light_${i}`} object={entry.light} />)}
        
          <color attach="background" args={['#000']} />
          
          {/* Use the stars variable to create the background */}
          {stars}

          {/* Use the particles variable to create the animation of the star */}
          {starParticles}

          {planets.map((data, index) => (
            <Planet
              key={`planet_${index}`}
              {...data} // Spread the data into props
              starMass={starMass}
              starSize={starSize}
              planetSizeFactor={planetSizeFactor}
              onStarCollision={handlePlanetToStarCollision}
              starPosition={starPosition}
              planets={planets}
              onPlanetCollision={handlePlanetToPlanetCollision}
              planetGravityFactor={planetGravityFactor}
            />
          ))}

          {/* Asteroids wait for their model here, so a late load never hides the rest of the scene */}
          <Suspense fallback={null}>
          {asteroids.map((asteroid) => (
            <Asteroid
              key={`asteroid_${asteroid.index}`}
              index={asteroid.index}
              position={asteroid.position}
              velocity={asteroid.velocity}
              angularVelocity={asteroid.angularVelocity}
              active={asteroid.active}
              moving={asteroid.moving}
              onStarCollision={handleAsteroidToStarCollision}
              asteroids={asteroids}
              onAsteroidCollision={handleAsteroidToAsteroidCollision}
              planets={planets}
              onPlanetCollision={handleAsteroidToPlanetCollision}
              starMass={starMass}
              starSize={starSize}
              asteroidMass={asteroidMass}
              planetSizeFactor={planetSizeFactor}
              asteroidGravityFactor={asteroidGravityFactor}
              starPosition={starPosition}
              planetGravityFactor={planetGravityFactor}
            />
          ))}
          </Suspense>

          {explosions.map((explosion) => (
            <Explosion
              key={`explosion_${explosion.index}`}
              index={explosion.index}
              lights={explosionLights}
              position={explosion.position}
              timestamp={explosion.timestamp}
              terminateExplosion={handleExplosionEnd}
            />
          ))}

          <Star size={starSize} starIntensity={starIntensity} />

        </scene>
      </Canvas>      
    </MouseEventsHandler>
  );
}

export default StarScene;
