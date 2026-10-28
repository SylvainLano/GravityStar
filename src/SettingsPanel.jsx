import React, { useState } from 'react';

import { sunMass } from './physics';

// The settings by default, which the Reset button brings back (the sound's volume is kept)
export const defaultSettings = {
  speed: 2, // 2 is the normal speed, 1 half of it, 0 the pause
  starSize: 0.4,
  starIntensity: 5, // luminosity of the star
  planetSizeFactor: 2, // the planets are drawn bigger than to scale, to be seen
  asteroidTrail: 3, // length of the trails: 0 for none, 3 for 4 seconds (see Trail.jsx)
  planetTrail: 0,
  launchMode: 'screen', // asteroids created facing the camera ('screen') or in the planets' plane ('orbital')
  trajectoryPreview: true, // dots showing where the asteroid will go, while aiming
  mainButton: 'launch', // dragging with the main button (or a finger) launches ('launch') or turns the view ('rotate')
  asteroidMass: 1, // in Earth masses
  asteroidGravityFactor: 10, // how much more the asteroids feel gravity
  planetGravityFactor: 100, // how much more the planets pull the asteroids
  starMass: sunMass, // in Earth masses
};

// A setting with a slider: its name (and the key that goes with it), the slider and its value, on one row
function Slider({ id, label, hint, min, max, step, value, onChange, shown = value }) {
  return (
    <div className="setting">
      <label htmlFor={id}>
        {label}
        {hint && <span className="setting-hint">{hint}</span>}
      </label>
      <input type="range" id={id} min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <output htmlFor={id}>{shown}</output>
    </div>
  );
}

// A setting with two choices: the active one is highlighted, and both names can be clicked too
function Toggle({ id, label, hint, choices, value, onChange }) {
  const [[off, offName], [on, onName]] = choices;
  return (
    <div className="setting">
      <label htmlFor={id}>
        {label}
        {hint && <span className="setting-hint">{hint}</span>}
      </label>
      <div className="setting-toggle">
        <span className={value === off ? 'switch-option active' : 'switch-option'} onClick={() => onChange(off)}>{offName}</span>
        <label className="switch">
          <input type="checkbox" id={id} role="switch" checked={value === on} onChange={(e) => onChange(e.target.checked ? on : off)} />
          <span className="switch-track" />
        </label>
        <span className={value === on ? 'switch-option active' : 'switch-option'} onClick={() => onChange(on)}>{onName}</span>
      </div>
    </div>
  );
}

// The settings panel, in the top left corner, by groups. With a mouse, it opens when hovered and closes when the mouse
// leaves it; on touch screens, where nothing is hovered, a tap on its title opens or closes it.
// onChange(name, value) changes one of the settings; the volume is apart, as it belongs to the sound (see App.jsx).
export default function SettingsPanel({ settings, onChange, onRandomize, onReset, volume, onVolumeChange }) {
  const [open, setOpen] = useState(false);
  const change = (name) => (value) => onChange(name, value);

  return (
    <div
      className={open ? 'simulation-parameters open' : 'simulation-parameters'}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false); }}
    >
      <div className="title">
        <button type="button" className="title-toggle" aria-expanded={open} onClick={() => setOpen((previous) => !previous)}>
          Change the settings here
        </button>
      </div>

      <div className="settings-body">
        <div className="settings-actions">
          <button type="button" className="settings-button primary" title="The planets at new places, with the same settings" onClick={onRandomize}>
            Randomize (R)
          </button>
          <button type="button" className="settings-button" title="Back to the settings by default" onClick={onReset}>
            Reset
          </button>
        </div>

        <section className="settings-group">
          <h3>Game</h3>
          <Slider id="speed" label="Speed" hint="Space: pause" min={0} max={10} step={1} value={settings.speed} onChange={change('speed')} shown={settings.speed === 0 ? 'Paused' : settings.speed} />
          <Slider id="volume" label="Volume" hint="M: sound on/off" min={0} max={10} step={1} value={volume} onChange={onVolumeChange} />
        </section>

        <section className="settings-group">
          <h3>Look</h3>
          <Slider id="star-size" label="Star Size" min={0.2} max={2} step={0.2} value={settings.starSize} onChange={change('starSize')} />
          <Slider id="star-luminosity" label="Star Luminosity" min={0} max={10} step={1} value={settings.starIntensity} onChange={change('starIntensity')} />
          <Slider id="planets-size" label="Planet Size" min={0.5} max={10} step={0.5} value={settings.planetSizeFactor} onChange={change('planetSizeFactor')} />
          {/* Lengths of the trails: 0 for none, then each step doubles them (see Trail.jsx) */}
          <Slider id="asteroid-trail" label="Asteroid Trail" min={0} max={10} step={1} value={settings.asteroidTrail} onChange={change('asteroidTrail')} />
          <Slider id="planet-trail" label="Planet Trail" min={0} max={10} step={1} value={settings.planetTrail} onChange={change('planetTrail')} />
        </section>

        <section className="settings-group">
          <h3>Throw</h3>
          <Toggle id="launch-mode" label="Launch Mode" choices={[['screen', 'Free Throw'], ['orbital', 'Orbital Plane']]} value={settings.launchMode} onChange={change('launchMode')} />
          <Toggle id="trajectory-preview" label="Trajectory Preview" hint="T: on/off" choices={[[false, 'Off'], [true, 'On']]} value={settings.trajectoryPreview} onChange={change('trajectoryPreview')} />
          <Toggle id="main-button" label="Left Button / Touch" hint="Right button: the other" choices={[['launch', 'Launch'], ['rotate', 'Rotate View']]} value={settings.mainButton} onChange={change('mainButton')} />
          <Slider id="asteroid-mass" label="Asteroid Mass" hint="Earth masses" min={0.5} max={10} step={0.5} value={settings.asteroidMass} onChange={change('asteroidMass')} />
        </section>

        <section className="settings-group">
          <h3>Gravity</h3>
          <Slider id="asteroid-sensitivity" label="Asteroid Sensitivity" hint="to gravity" min={-100} max={100} step={10} value={settings.asteroidGravityFactor} onChange={change('asteroidGravityFactor')} />
          <Slider id="planet-gravity-factor" label="Planet Gravity" hint="on asteroids" min={-2400} max={2600} step={500} value={settings.planetGravityFactor} onChange={change('planetGravityFactor')} />
          {/* In Suns: 1 is the default star, whose pull holds the planets on their orbits */}
          <Slider id="star-mass" label="Star Mass" hint="Breaks the orbits!" min={-9667000} max={10333000} step={1000000} value={settings.starMass} onChange={change('starMass')} shown={`×${Math.round(settings.starMass / sunMass)}`} />
        </section>

        <div className="settings-keys">
          <span>H: hide the interface</span>
          <span>F: full screen</span>
          <span>V: reset the view</span>
        </div>
      </div>
    </div>
  );
}
