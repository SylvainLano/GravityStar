import React, { useCallback, useEffect, useRef, useState } from 'react';
import StarScene from './StarScene';
import SkinSelector from './SkinSelector';
import { initialSkinId, rememberSkin } from './skins/skins';

// Create a separate component for simulation parameters
function SimulationParameters({ speed, onSpeedChange, onRandomSystem, asteroidTrail, onAsteroidTrailChange, planetTrail, onPlanetTrailChange, starSize, onStarSizeChange, planetSizeFactor, onPlanetSizeFactorChange, starMass, onStarMassChange, asteroidMass, onAsteroidMassChange, asteroidGravityFactor, onAsteroidGravityFactorChange, planetGravityFactor, onPlanetGravityFactorChange, starIntensity, onStarIntensityChange, launchMode, onLaunchModeChange }) {
  // With a mouse, the panel opens when hovered and closes when the mouse leaves it.
  // On touch screens, where nothing is hovered, a tap on its title opens or closes it.
  const [open, setOpen] = useState(false);

  return (
    <div
      className={open ? 'simulation-parameters open' : 'simulation-parameters'}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false); }}
    >
      <div className="title">
        <button type="button" className="title-toggle" aria-expanded={open} onClick={() => setOpen((previous) => !previous)}>
          Change the settings here
        </button>
        <br />
      </div>

      <div className="parameter">
        <br />
        <label htmlFor="speed">Speed (Space: pause):</label>
        <input
          type="range"
          id="speed"
          min={0}
          max={10}
          step={1}
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
        <span>{speed === 0 ? 'Paused' : speed}</span>
      </div>

      <div className="parameter">
        <button type="button" className="panel-button" onClick={onRandomSystem}>
          New random system (R)
        </button>
      </div>

      <div className="parameter">
        <label htmlFor="star-size">Star Size:</label>
        <input
          type="range"
          id="star-size"
          min={0.2}
          max={2}
          step={0.2}
          value={starSize}
          onChange={(e) => onStarSizeChange(parseFloat(e.target.value))}
        />
        <span>{starSize}</span>
      </div>

      <div className="parameter">
        <label htmlFor="star-luminosity">Star Luminosity:</label>
        <input
          type="range"
          id="star-luminosity"
          min={0}
          max={10}
          step={1}
          value={starIntensity}
          onChange={(e) => onStarIntensityChange(parseFloat(e.target.value))}
        />
        <span>{starIntensity}</span>
      </div>

      <div className="parameter">
        <label htmlFor="planets-size">Planet Size:</label>
        <input
          type="range"
          id="planets-size"
          min={0.5}
          max={10}
          step={0.5}
          value={planetSizeFactor}
          onChange={(e) => onPlanetSizeFactorChange(parseFloat(e.target.value))}
        />
        <span>{planetSizeFactor}</span>
      </div>

      {/* Lengths of the trails: 0 for none, then each step doubles them (see Trail.jsx) */}
      <div className="parameter">
        <label htmlFor="asteroid-trail">Asteroid Trail:</label>
        <input
          type="range"
          id="asteroid-trail"
          min={0}
          max={10}
          step={1}
          value={asteroidTrail}
          onChange={(e) => onAsteroidTrailChange(parseFloat(e.target.value))}
        />
        <span>{asteroidTrail}</span>
      </div>

      <div className="parameter">
        <label htmlFor="planet-trail">Planet Trail:</label>
        <input
          type="range"
          id="planet-trail"
          min={0}
          max={10}
          step={1}
          value={planetTrail}
          onChange={(e) => onPlanetTrailChange(parseFloat(e.target.value))}
        />
        <span>{planetTrail}</span>
      </div>

      <div className="parameter">
        <label htmlFor="asteroid-mass">Asteroid Mass:</label>
        <input
          type="range"
          id="asteroid-mass"
          min={0.5}
          max={10}
          step={0.5}
          value={asteroidMass}
          onChange={(e) => onAsteroidMassChange(parseFloat(e.target.value))}
        />
        <span>{asteroidMass}</span>
      </div>

      <div className="parameter">
        <label htmlFor="asteroid-sensitivity">Asteroid Sensitivity to Gravity:</label>
        <br />
        <input
          type="range"
          id="asteroid-sensitivity"
          min={-100}
          max={100}
          step={10}
          value={asteroidGravityFactor}
          onChange={(e) => onAsteroidGravityFactorChange(parseFloat(e.target.value))}
        />
        <span>{asteroidGravityFactor}</span>
      </div>

      <div className="parameter">
        <label htmlFor="planet-gravity-factor">Planet Gravity on Asteroids:</label>
        <br />
        <input
          type="range"
          id="planet-gravity-factor"
          min={-2400}
          max={2600}
          step={500}
          value={planetGravityFactor}
          onChange={(e) => onPlanetGravityFactorChange(parseFloat(e.target.value))}
        />
        <span>{planetGravityFactor}</span>
      </div>

      <div className="parameter">
        <label htmlFor="launch-mode">Launch Mode:</label>
        <br />
        {/* Switch between the two modes: the active one is highlighted, and both names can be clicked too */}
        <span className={launchMode === 'screen' ? 'switch-option active' : 'switch-option'} onClick={() => onLaunchModeChange('screen')}>
          Free Throw
        </span>
        <label className="switch">
          <input
            type="checkbox"
            id="launch-mode"
            role="switch"
            checked={launchMode === 'orbital'}
            onChange={(e) => onLaunchModeChange(e.target.checked ? 'orbital' : 'screen')}
          />
          <span className="switch-track" />
        </label>
        <span className={launchMode === 'orbital' ? 'switch-option active' : 'switch-option'} onClick={() => onLaunchModeChange('orbital')}>
          Orbital Plane
        </span>
      </div>

      <div className="parameter">
        <br />
        <br />
        <label>Warning: this will break orbits!</label>
      </div>

      <div className="parameter">
        <label htmlFor="star-mass">Star Mass:</label>
        <input
          type="range"
          id="star-mass"
          min={-9667000}
          max={10333000}
          step={1000000}
          value={starMass}
          onChange={(e) => onStarMassChange(parseFloat(e.target.value))}
        />
        <span>{starMass}</span>
      </div>
    </div>
  );
}

function App() {
  // Define state variables for simulation parameters
  const [starSize, setStarSize] = useState(0.4); // Default is 0.4 for the star to be reasonably sized
  const [planetSizeFactor, setPlanetSizeFactor] = useState(2); // Default is 2 to better see the planets
  const [starMass, setStarMass] = useState(333000); // 333000 times the mass of the earth
  const [asteroidMass, setAsteroidMass] = useState(1); // times the mass of the earth
  const [asteroidGravityFactor, setAsteroidGravityFactor] = useState(10); // increase the gravity for asteroids
  const [planetGravityFactor, setPlanetGravityFactor] = useState(100); // increase the gravity of the planets toward asteroids
  const [starIntensity, setStarIntensity] = useState(5); // increase the luminosity of the star
  const [launchMode, setLaunchMode] = useState('screen'); // asteroids are created facing the camera ('screen') or in the planets' plane ('orbital')
  const [skinId, setSkinId] = useState(initialSkinId); // the look of the game, see src/skins
  const [speed, setSpeed] = useState(2); // speed of the simulation: 2 is the normal speed, 1 half of it, 0 the pause
  const [system, setSystem] = useState(0); // increased to start again with a new random system
  const [asteroidTrail, setAsteroidTrail] = useState(3); // length of the asteroids' trails: 0 for none, 3 for 4 seconds (see Trail.jsx)
  const [planetTrail, setPlanetTrail] = useState(0); // length of the planets' trails, none by default
  const newRandomSystem = useCallback(() => setSystem((previous) => previous + 1), []);

  const changeSkin = useCallback((id) => {
    setSkinId(id);
    rememberSkin(id);
  }, []);

  // The space bar pauses the game, and resumes it at the speed it had before. The R key starts a new random system.
  const lastSpeed = useRef(speed);
  useEffect(() => {
    if (speed > 0) lastSpeed.current = speed;
  }, [speed]);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input[type="text"], select, textarea')) return;
      if ((e.key === 'r' || e.key === 'R') && !e.repeat) newRandomSystem();
      if (e.code !== 'Space') return;
      // Also keeps the space bar from pressing the focused button (a skin, the settings' title)
      e.preventDefault();
      if (!e.repeat) setSpeed((current) => (current > 0 ? 0 : lastSpeed.current));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="App" data-skin={skinId}>
      <StarScene
        starSize={starSize}
        planetSizeFactor={planetSizeFactor}
        starMass={starMass}
        asteroidMass={asteroidMass}
        asteroidGravityFactor={asteroidGravityFactor}
        planetGravityFactor={planetGravityFactor}
        starIntensity={starIntensity}
        launchMode={launchMode}
        skinId={skinId}
        speed={speed}
        system={system}
        asteroidTrail={asteroidTrail}
        planetTrail={planetTrail}
      />
      <SimulationParameters
        speed={speed}
        onSpeedChange={setSpeed}
        onRandomSystem={newRandomSystem}
        asteroidTrail={asteroidTrail}
        onAsteroidTrailChange={setAsteroidTrail}
        planetTrail={planetTrail}
        onPlanetTrailChange={setPlanetTrail}
        starSize={starSize}
        onStarSizeChange={setStarSize}
        planetSizeFactor={planetSizeFactor}
        onPlanetSizeFactorChange={setPlanetSizeFactor}
        starMass={starMass}
        onStarMassChange={setStarMass}
        asteroidMass={asteroidMass}
        onAsteroidMassChange={setAsteroidMass}
        asteroidGravityFactor={asteroidGravityFactor}
        onAsteroidGravityFactorChange={setAsteroidGravityFactor}
        planetGravityFactor={planetGravityFactor}
        onPlanetGravityFactorChange={setPlanetGravityFactor}
        starIntensity={starIntensity}
        onStarIntensityChange={setStarIntensity}
        launchMode={launchMode}
        onLaunchModeChange={setLaunchMode}
      />
      <SkinSelector skinId={skinId} onSkinChange={changeSkin} />
      {/* Shown during the pause, even with the settings closed: a tap on it resumes the game too, for touch screens */}
      {speed === 0 && (
        <button type="button" className="paused" onClick={() => setSpeed(lastSpeed.current)}>
          Paused · Space or tap to resume
        </button>
      )}
      {/* Credits required by the licenses of the 3D model and of the textures */}
      <div className="credits">
        <a href="https://sketchfab.com/3d-models/meteorite-0a503e5bec784cbc9082e2f6b2d9f701" target="_blank" rel="noopener noreferrer">"Meteorite"</a>
        {' by '}
        <a href="https://sketchfab.com/hailphilly" target="_blank" rel="noopener noreferrer">Hailphilly</a>
        {' (simplified), '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
        {' · Planet textures by '}
        <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer">Solar System Scope</a>
        {', '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
      </div>
    </div>
  );
}

export default App;
