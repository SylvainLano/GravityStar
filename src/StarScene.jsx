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

// Keep loaded files in memory (the sun texture is reloaded when its luminosity changes)
THREE.Cache.enabled = true;

// Setting up the positions shared by the scene and the launching controls
const starPosition = new THREE.Vector3(0, 0, 0);
const cameraPosition = new THREE.Vector3(0, 5, 6);
// Calculate the reference position to spawn asteroids between the camera and the star
const asteroidStartingPosition = new THREE.Vector3().copy(cameraPosition).lerp(starPosition, 0.25);
asteroidStartingPosition.y -= 0.5;
// Asteroids are created under the pointer, on one of these planes depending on the launch mode:
// 'screen' faces the camera at the distance of the reference position, 'orbital' is the plane where the planets orbit
const screenLaunchPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
  new THREE.Vector3().subVectors(starPosition, cameraPosition).normalize(),
  asteroidStartingPosition
);
const orbitalLaunchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
// Clicks farther than this from the star on the orbital plane are ignored (Neptune orbits at about 17)
const maxOrbitalLaunchDistance = 25;
// Scaling the force with which launching the asteroids (velocity per unit dragged on the launch plane)
const dragVelocityScale = 0.009;
// Scaling the momentum toward the star for the launch
const momentumScale = 0.0005;

// Reused by the pointer handlers, to avoid creating new objects on every move
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPoint = new THREE.Vector3();
const directionToStar = new THREE.Vector3();
const projection = new THREE.Vector3();
function StarScene({starSize, planetSizeFactor, starMass, asteroidMass, asteroidGravityFactor, planetGravityFactor, starIntensity, launchMode}) {
  
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

  // The aim is kept out of React state, so that moving the pointer never re-renders the scene
  const three = useRef(null); // R3F state (camera...), set once the canvas is created
  const aim = useRef({
    active: false,
    pointerId: null,
    asteroidIndex: null,
    mode: 'screen',
    origin: new THREE.Vector3(),
    velocity: new THREE.Vector3()
  });

  // Find where the pointer points on a plane (null if it points away from it)
  const pointerOnPlane = (e, plane, target) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, three.current.camera);
    return raycaster.ray.intersectPlane(plane, target);
  };

  const handlePointerDown = (e) => {
    // One asteroid at a time, launched with the main mouse button, a finger or a pen
    if (aim.current.active || !three.current || (e.pointerType === 'mouse' && e.button !== 0)) return;

    // Create the asteroid under the pointer, on the plane of the current launch mode
    const plane = launchMode === 'orbital' ? orbitalLaunchPlane : screenLaunchPlane;
    const origin = pointerOnPlane(e, plane, aim.current.origin);
    if (!origin || (launchMode === 'orbital' && origin.length() > maxOrbitalLaunchDistance)) return;

    // Keep receiving the pointer events even if the pointer leaves the scene before being released
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone: it will be released right away
    }

    Object.assign(aim.current, { active: true, pointerId: e.pointerId, asteroidIndex: nextKey, mode: launchMode });
    aim.current.velocity.set(0, 0, 0);

    const initialVelocity = new THREE.Vector3(0, 0, 0);
    const newAsteroid = {
      index: nextKey,
      position: origin.clone(),
      velocity: initialVelocity,
      angularVelocity: initialVelocity,
      active: true,
      moving: false
    };

    setNextKey((prevNextKey) => prevNextKey + 1);
    setAsteroids((prevAsteroids) => [...prevAsteroids, newAsteroid]);
  };

  // Aim from where the asteroid was created towards the pointer
  const updateAim = (e) => {
    const plane = aim.current.mode === 'orbital' ? orbitalLaunchPlane : screenLaunchPlane;
    if (!pointerOnPlane(e, plane, dragPoint)) return;

    const velocity = aim.current.velocity.subVectors(dragPoint, aim.current.origin).multiplyScalar(dragVelocityScale);

    if (aim.current.mode === 'screen') {
      // Keep the throw purely lateral, the momentum towards the star is added at launch
      directionToStar.subVectors(starPosition, aim.current.origin);
      velocity.sub(projection.copy(velocity).projectOnVector(directionToStar));
    }
  };

  const handlePointerMove = (e) => {
    if (aim.current.active && e.pointerId === aim.current.pointerId) {
      updateAim(e);
    }
  };

  const handlePointerUp = (e) => {
    if (!aim.current.active || e.pointerId !== aim.current.pointerId) return;
    updateAim(e);
    aim.current.active = false;

    // Launch with the aimed velocity (plus a small momentum towards the star when thrown in front of the camera)
    const launchVelocity = aim.current.velocity.clone();
    if (aim.current.mode === 'screen') {
      launchVelocity.add(directionToStar.subVectors(starPosition, aim.current.origin).multiplyScalar(momentumScale));
    }

    const launchedIndex = aim.current.asteroidIndex;
    setAsteroids((prevAsteroids) =>
      prevAsteroids.map((asteroid) => (asteroid.index === launchedIndex
        ? { ...asteroid, moving: true, velocity: launchVelocity, angularVelocity: launchVelocity }
        : asteroid))
    );
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
      <Canvas
        shadows
        camera={{ position: cameraPosition }}
        gl={{antialias: true}}
        // Full screen, without scrolling or zooming the page when aiming with a finger
        style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
        onCreated={(state) => { three.current = state; }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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

          {/* Launching arrow, shown while aiming */}
          <Arrow aim={aim} referenceDistance={cameraPosition.distanceTo(asteroidStartingPosition)} />

        </scene>
      </Canvas>
  );
}

export default StarScene;
