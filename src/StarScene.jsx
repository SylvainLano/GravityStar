import { useRef, useMemo, useState, useCallback, useEffect, useLayoutEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import Asteroid from './Asteroid';
import StarParticle from './StarParticle';
import Star from './Star';
import TwinklingStar from './TwinklingStar';
import Arrow from './Arrow';
import TrajectoryPreview from './TrajectoryPreview';
import Planet from './Planet';
import Explosion from './Explosion';
import { SimulationClock, SimulationContext, createSimulation } from './SimulationClock';
import { asteroidCollisionDistance } from './physics';
import { findSkin } from './skins/skins';
import { SkinProvider } from './skins/SkinContext';
import BackgroundStars from './skins/BackgroundStars';

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
// Reach of the spotlight at the camera
const spotRange = 4;
// Zoom: the camera moves along its line of sight towards the star, between these distances
// (the launch plane and the spotlight move with it)
const defaultCameraDistance = cameraPosition.length();
const minCameraDistance = 3;
const maxCameraDistance = 30;
// The background stars surround the camera at this distance, as if infinitely far, whatever the zoom (see Sky)
const skyRadius = 60;

// Reused by the pointer handlers, to avoid creating new objects on every move
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPoint = new THREE.Vector3();
const directionToStar = new THREE.Vector3();
const projection = new THREE.Vector3();

/* The planets
    velocity is 10 divided by a hundred times the square root of days around the sun
    size is the square root of diameter divided by 2000
    distance is choosen in order to see all planets on the scene (close to AU*8/10 for inner planets), plus the star's size
    rotation is 0.01 divided by the number of earth days for the planet to rotate on itself
    mass is the ratio to earth mass
    startArc: the angles between which the planet starts, at random, in degrees (0 is on the right of the star, 90 behind it):
      the outer planets start behind the star, where the camera sees the farthest */
const planetData = [
  { name: 'mercury', size: 0.0349, distance: 0.8, velocity: 10 / 938, rotation: 0.00017, planetTexture: './img/2k_mercury.jpg', mass: 0.055, startArc: [0, 360] },
  { name: 'venus', size: 0.055, distance: 1.44, velocity: 10 / 1559, rotation: 0.000041, planetTexture: './img/2k_venus_atmosphere.jpg', mass: 0.815, startArc: [0, 360] },
  { name: 'earth', size: 0.05644, distance: 2, velocity: 10 / 1910, rotation: 0.01, planetTexture: './img/2k_earth_daymap.jpg', mass: 1, startArc: [0, 360] },
  { name: 'mars', size: 0.0412, distance: 3.04, velocity: 10 / 2621, rotation: 0.01, planetTexture: './img/2k_mars.jpg', mass: 0.107, startArc: [0, 360] },
  { name: 'jupiter', size: 0.1889, distance: 6.2, velocity: 10 / 6583, rotation: 0.024, planetTexture: './img/2k_jupiter.jpg', mass: 316, startArc: [20, 160] },
  { name: 'saturn', size: 0.1706, distance: 9.5, velocity: 10 / 10373, rotation: 0.0229, planetTexture: './img/2k_saturn.jpg', mass: 95, startArc: [40, 140] },
  { name: 'uranus', size: 0.1126, distance: 13, velocity: 10 / 17517, rotation: 0.0141, planetTexture: './img/2k_uranus.jpg', mass: 14.53, startArc: [55, 125] },
  { name: 'neptune', size: 0.1105, distance: 17, velocity: 10 / 24500, rotation: 0.015, planetTexture: './img/2k_neptune.jpg', mass: 17.15, startArc: [60, 120] },
];

// Places each planet at a random angle of its start arc, on its circular orbit, with its velocity along the orbit
function createPlanets(starSize) {
  return planetData.map((planet, i) => {
    const [from, to] = planet.startArc;
    const angle = THREE.MathUtils.degToRad(from + Math.random() * (to - from));
    const radius = planet.distance + starSize;
    return {
      index: i + 1,
      name: planet.name,
      size: planet.size,
      position: new THREE.Vector3(radius * Math.cos(angle), 0, -radius * Math.sin(angle)),
      velocity: new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle)).multiplyScalar(planet.velocity),
      rotation: { x: 0, y: planet.rotation, z: 0 },
      planetTexture: planet.planetTexture,
      mass: planet.mass,
      shouldCorrectOrbit: true,
    };
  });
}

// The velocity an asteroid gets when released, written into target: the aimed velocity,
// plus a small momentum towards the star when thrown in front of the camera
function getLaunchVelocity(aim, target) {
  target.copy(aim.velocity);
  if (aim.mode === 'screen') {
    target.add(directionToStar.subVectors(starPosition, aim.origin).multiplyScalar(momentumScale));
  }
  return target;
}

// Puts the camera at the chosen position, looking at the star
function CameraZoom({ position }) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.copy(position);
    camera.lookAt(starPosition);
  }, [camera, position]);
  return null;
}

// Keeps the background stars around the camera
function Sky({ children }) {
  const sky = useRef();
  useFrame(({ camera }) => { sky.current.position.copy(camera.position); });
  return <group ref={sky}>{children}</group>;
}

// system: a counter, increased to start again with a new random system
function StarScene({starSize, planetSizeFactor, starMass, asteroidMass, asteroidGravityFactor, planetGravityFactor, starIntensity, launchMode, skinId, speed, system}) {

  const skin = findSkin(skinId);
  const canvasRef = useRef();
  // Clock of the simulation, advanced at the chosen speed (see SimulationClock)
  const simulation = useRef(null);
  if (simulation.current === null) simulation.current = createSimulation();

  const [explosions, setExplosions] = useState([]);
  // Identifiers of asteroids and explosions: a counter outside React state never hands out the same one twice
  const nextKey = useRef(0);

  // The planets, each at a random angle of its orbit (see createPlanets)
  const [planets, setPlanets] = useState(() => createPlanets(starSize));

  // Create a spotlight where the camera is to see the asteroids to be launched
  // (created once: a new light on every render made React replace it each time)
  const spotlight = useMemo(() => {
    const light = new THREE.SpotLight(0xffffff); // Set the light color
    light.position.copy(cameraPosition); // Set the light position
    // 15 with physical lights matches the former intensity of 4 with three.js' legacy lights
    light.intensity = 15;
    // Set spotlight parameters
    light.distance = spotRange; // Adjust the light's distance
    light.angle = Math.PI / 3; // Set the cone angle (adjust as needed)
    light.penumbra = 0; // No penumbra: the edge of the light is sharp
    light.target.position.copy(starPosition);
    return light;
  }, []);

  // Zoom with the mouse wheel (or a pinch on a touchpad), and the + and - keys
  const [cameraDistance, setCameraDistance] = useState(defaultCameraDistance);
  const zoom = cameraDistance / defaultCameraDistance;
  const viewPosition = useMemo(() => cameraPosition.clone().multiplyScalar(zoom), [zoom]);
  useEffect(() => {
    const zoomBy = (factor) => setCameraDistance((distance) => THREE.MathUtils.clamp(distance * factor, minCameraDistance, maxCameraDistance));
    const onWheel = (e) => {
      // Also keeps a pinch on a touchpad (a wheel event with the Ctrl key) from zooming the whole page
      e.preventDefault();
      const pixels = e.deltaY * (e.deltaMode === 1 ? 33 : 1); // Some browsers count the wheel in lines
      zoomBy(Math.exp(pixels * (e.ctrlKey ? 0.01 : 0.0015)));
    };
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input[type="text"], select, textarea')) return;
      if (e.key === '+' || e.key === '=') zoomBy(1 / 1.15);
      if (e.key === '-') zoomBy(1.15);
    };
    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // The spotlight and the plane where asteroids are thrown in front of the camera keep their place relative to the camera
  useLayoutEffect(() => {
    spotlight.position.copy(viewPosition);
    spotlight.distance = spotRange * zoom;
    spotlight.intensity = 15 * zoom * zoom; // The same light on the launch plane, whose distance grows with the zoom
    const launchPoint = viewPosition.clone().lerp(starPosition, 0.25);
    launchPoint.y -= 0.5 * zoom;
    screenLaunchPlane.setFromNormalAndCoplanarPoint(screenLaunchPlane.normal, launchPoint);
  }, [spotlight, viewPosition, zoom]);

  // Creating the stars in the background, around the camera (see Sky)
  const numStars = 200;
  const stars = useMemo(() => {
    const starsArray = [];
    // They had the size of stars twice as far as the camera from the star, so far: they keep the same size on screen
    const sizeScale = skyRadius / (2 * defaultCameraDistance);

    for (let i = 0; i < numStars; i++) {
      const polarAngle = Math.random() * Math.PI * 2; // Random angle in spherical coordinates
      const inclinationAngle = (Math.random() - 0.5) * Math.PI; // Random inclination angle
      const x = skyRadius * Math.cos(polarAngle) * Math.cos(inclinationAngle);
      const y = skyRadius * Math.sin(polarAngle) * Math.cos(inclinationAngle);
      const z = skyRadius * Math.sin(inclinationAngle);

      const radius = (Math.random() * 0.006 + 0.01) * sizeScale;
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
    // Never inside another asteroid, which it would hit at once (they may wait together while the game is paused)
    if (asteroids.some((asteroid) => asteroid.position.distanceTo(origin) < asteroidCollisionDistance)) return;

    // Keep receiving the pointer events even if the pointer leaves the scene before being released
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone: it will be released right away
    }

    const index = nextKey.current++;
    Object.assign(aim.current, { active: true, pointerId: e.pointerId, asteroidIndex: index, mode: launchMode });
    aim.current.velocity.set(0, 0, 0);

    const initialVelocity = new THREE.Vector3(0, 0, 0);
    const newAsteroid = {
      index: index,
      position: origin.clone(),
      velocity: initialVelocity,
      angularVelocity: initialVelocity,
      active: true,
      moving: false
    };

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

    const launchVelocity = getLaunchVelocity(aim.current, new THREE.Vector3());

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
    // Add a new explosion to the array
    const newExplosion = {
      index: nextKey.current++,
      position: position,
      timestamp: simulation.current.time
    };
    setExplosions((prevExplosions) => [...prevExplosions, newExplosion]);

    // Update the state to remove the collided asteroid
    setAsteroids((prevAsteroids) => prevAsteroids.filter((asteroid) => asteroid.index !== collidedAsteroid1 && asteroid.index !== collidedAsteroid2));
  }, []);

  const handleAsteroidToPlanetCollision = useCallback((collidedAsteroid, collidedPlanet, position, momentumToAdd, angularMomentumToAdd) => {

    // Add a new explosion to the array
    const newExplosion = {
      index: nextKey.current++,
      position: position,
      timestamp: simulation.current.time
    };
    setExplosions((prevExplosions) => [...prevExplosions, newExplosion]);

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

  }, []);

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

  }, []);

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

  // A new random system: every planet back on its orbit at a new place, without asteroids nor explosions (the settings stay)
  useEffect(() => {
    if (system === 0) return;
    aim.current.active = false;
    setAsteroids([]);
    setExplosions([]);
    setPlanets(createPlanets(starSize).map((planet) => ({ ...planet, shouldCorrectOrbit: starMass === 333000 })));
  }, [system]);

  return (
      <Canvas
        ref={canvasRef}
        className="scene"
        shadows
        camera={{ position: cameraPosition }}
        gl={{antialias: true}}
        // Skins with big pixels are rendered at a lower resolution, then scaled up without smoothing (see styles.css)
        dpr={skin.pixelSize ? window.devicePixelRatio / skin.pixelSize : [1, 2]}
        // Full screen, without scrolling or zooming the page when aiming with a finger
        style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
        onCreated={(state) => { three.current = state; }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <SimulationContext.Provider value={simulation}>
        <SimulationClock simulation={simulation} speed={speed} />
        <CameraZoom position={viewPosition} />
        <SkinProvider skinId={skinId} lightPosition={starPosition} starIntensity={starIntensity} spotPosition={viewPosition} spotRange={spotRange * zoom}>
        {/* Set up the scene and camera */}
        <scene>

          {/* Add the spotlight to the scene */}
          <primitive object={spotlight} />

          {/* Add the light coming from the star to illuminate the system
              Intensity, distance and decay are tuned for physical lights to match the former look of three.js' legacy lights
              (one light at the center lights the planets like the former ring of 20 lights, for a fraction of the cost) */}
          <pointLight position={starPosition} intensity={starIntensity * 3.6} distance={19} decay={0.75} />

          {/* Add the lights shared by the explosions */}
          {explosionLights.map((entry, i) => <primitive key={`explosion_light_${i}`} object={entry.light} />)}

          {/* Use the stars variable to create the background (points of a fixed size in the stylized skins).
              The color behind them is drawn by CSS, behind the transparent canvas (see styles.css). */}
          <Sky>{skin.stars ? <BackgroundStars {...skin.stars} /> : stars}</Sky>

          {/* Use the particles variable to create the animation of the star */}
          {starParticles}

          {planets.map((data) => (
            <Planet
              key={`planet_${data.index}`}
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

          {/* Where the asteroid will go, shown while aiming */}
          <TrajectoryPreview
            aim={aim}
            getLaunchVelocity={getLaunchVelocity}
            planets={planets}
            starPosition={starPosition}
            starMass={starMass}
            starSize={starSize}
            asteroidGravityFactor={asteroidGravityFactor}
            planetGravityFactor={planetGravityFactor}
            planetSizeFactor={planetSizeFactor}
            color={skin.arrow ?? 'red'}
          />

        </scene>
        </SkinProvider>
        </SimulationContext.Provider>
      </Canvas>
  );
}

export default StarScene;
