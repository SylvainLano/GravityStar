import React, { useState } from 'react';
import StarScene from './StarScene';

// Create a separate component for simulation parameters
function SimulationParameters({ starSize, onStarSizeChange, planetSizeFactor, onPlanetSizeFactorChange, starMass, onStarMassChange, asteroidMass, onAsteroidMassChange, asteroidGravityFactor, onAsteroidGravityFactorChange, planetGravityFactor, onPlanetGravityFactorChange, starIntensity, onStarIntensityChange }) {
  return (
    <div className="simulation-parameters">
      <div className="title">
        <label>Change the settings here</label>
        <br />
      </div>

      <div className="parameter">
        <br />
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
        <label htmlFor="planets-size">Planets Size:</label>
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
        <label htmlFor="asteroid-sensitivity">Asteroid Sensitivity To Gravity:</label>
        <br />
        <input
          type="range"
          id="asteroid-sensitivity"
          min={0}
          max={100}
          step={10}
          value={asteroidGravityFactor}
          onChange={(e) => onAsteroidGravityFactorChange(parseFloat(e.target.value))}
        />
        <span>{asteroidGravityFactor}</span>
      </div>

      <div className="parameter">
        <label htmlFor="planet-gravity-factor">Planet Gravity towards Asteroids:</label>
        <br />
        <input
          type="range"
          id="planet-gravity-factor"
          min={0}
          max={1000}
          step={100}
          value={planetGravityFactor}
          onChange={(e) => onPlanetGravityFactorChange(parseFloat(e.target.value))}
        />
        <span>{planetGravityFactor}</span>
      </div>

      <div className="parameter">
        <br />
        <br />
        <label>WARNING : This will break orbits!</label>
      </div>

      <div className="parameter">
        <label htmlFor="star-mass">Star Mass:</label>
        <input
          type="range"
          id="star-mass"
          min={333000}
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
  const [starSize, setStarSize] = useState(0.4); // Default is 0.4 for the star to be reasonnably sized
  const [planetSizeFactor, setPlanetSizeFactor] = useState(2); // Default is 2 to better see the planets
  const [starMass, setStarMass] = useState(333000); // 333000 times the mass of the earth
  const [asteroidMass, setAsteroidMass] = useState(1); // times the mass of the earth
  const [asteroidGravityFactor, setAsteroidGravityFactor] = useState(10); // increase the gravity for asteroids
  const [planetGravityFactor, setPlanetGravityFactor] = useState(100); // increase the gravity of the planets toward asteroids
  const [starIntensity, setStarIntensity] = useState(5); // increase the luminosity of the star

  return (
    <div className="App">
      <StarScene
        starSize={starSize}
        planetSizeFactor={planetSizeFactor}
        starMass={starMass}
        asteroidMass={asteroidMass}
        asteroidGravityFactor={asteroidGravityFactor}
        planetGravityFactor={planetGravityFactor}
        starIntensity={starIntensity}
      />
      <SimulationParameters
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
      />
    </div>
  );
}

export default App;
