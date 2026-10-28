import React, { useCallback, useEffect, useRef, useState } from 'react';
import StarScene from './StarScene';
import SkinSelector from './SkinSelector';
import SoundToggle from './SoundToggle';
import SettingsPanel, { defaultSettings } from './SettingsPanel';
import { AchievementToasts, AchievementsBoard, AchievementsButton, useAchievements } from './AchievementsBoard';
import { collect, unlock } from './achievements';
import { defaultVolume, getVolume, isSoundOn, setSoundOn, setVolume } from './audio/sound';
import { initialSkinId, rememberSkin, skins } from './skins/skins';

function App() {
  // The settings of the panel (see SettingsPanel for what they are), changed one by one or all reset at once
  const [settings, setSettings] = useState(defaultSettings);
  const changeSetting = useCallback((name, value) => setSettings((previous) => ({ ...previous, [name]: value })), []);
  const resetSettings = useCallback(() => setSettings(defaultSettings), []);
  const { speed } = settings;
  const setSpeed = useCallback((update) => setSettings((previous) => (
    { ...previous, speed: typeof update === 'function' ? update(previous.speed) : update }
  )), []);
  const [skinId, setSkinId] = useState(initialSkinId); // the look of the game, see src/skins
  const [system, setSystem] = useState(0); // increased to start again with a new random system
  const newRandomSystem = useCallback(() => {
    setSystem((previous) => previous + 1);
    unlock('reroll');
  }, []);
  // Sound: always off when the game starts. The volume sliders show 0 while it is off; switching it on brings back
  // the level (1 to 10) it had before being cut, remembered for the next visits (see audio/sound.js)
  const [soundOn, setSoundOnState] = useState(false);
  const [volume, setVolumeState] = useState(() => Math.round(getVolume() * 10));
  const switchSound = useCallback((on) => {
    setSoundOn(on); // Within the click, the key press or the slider's move, as browsers require to start the sound
    setSoundOnState(on);
    if (on) unlock('music');
  }, []);
  const toggleSound = useCallback(() => switchSound(!isSoundOn()), []);
  const changeLevel = useCallback((value) => {
    setVolumeState(value);
    setVolume(value / 10);
  }, []);
  // Sliding the volume up switches the sound on, sliding it down to 0 cuts it: it will then come back at the default level
  const changeVolume = useCallback((value) => {
    if (value === 0) {
      changeLevel(Math.round(defaultVolume * 10));
      switchSound(false);
      return;
    }
    changeLevel(value);
    if (!isSoundOn()) switchSound(true);
  }, []);

  const changeSkin = useCallback((id) => {
    setSkinId(id);
    rememberSkin(id);
  }, []);

  // The interface can be hidden, to look at the scene or take a picture of it. When it is hidden, a reminder of how
  // to bring it back is shown for a moment (hintCount restarts it).
  const [interfaceHidden, setInterfaceHidden] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const toggleInterface = useCallback(() => {
    setInterfaceHidden((hidden) => !hidden);
    setHintCount((count) => count + 1);
  }, []);
  // Full screen without the interface, or back to the page
  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (!document.documentElement.requestFullscreen) return; // Not available everywhere (iPhones)
    // Within the key press, as browsers require
    document.documentElement.requestFullscreen().then(() => {
      setInterfaceHidden(true);
      setHintCount((count) => count + 1);
    }).catch(() => {});
  }, []);
  // The achievements (see achievements.js): the trophy opens their board, a notification shows each new one
  const { unlocked, toasts } = useAchievements();
  const [boardOpen, setBoardOpen] = useState(false);
  const closeBoard = useCallback(() => setBoardOpen(false), []);
  useEffect(() => { if (speed === 10) unlock('fast-forward'); }, [speed]);
  useEffect(() => { collect('skins-worn', skinId, skins.length, 'fashion'); }, [skinId]);
  useEffect(() => { if (interfaceHidden) unlock('ghost'); }, [interfaceHidden]);

  // Leaving the full screen, with F or the browser's own way (Esc), brings the interface back
  useEffect(() => {
    const onFullScreenChange = () => { if (!document.fullscreenElement) setInterfaceHidden(false); };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  // The space bar pauses the game, and resumes it at the speed it had before. The R key starts a new random system,
  // the M key switches the sound on and off, the T key the trajectory preview. The H key hides the interface, the F key
  // puts the game in full screen without it.
  const lastSpeed = useRef(speed);
  useEffect(() => {
    if (speed > 0) lastSpeed.current = speed;
  }, [speed]);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input[type="text"], select, textarea')) return;
      if ((e.key === 'r' || e.key === 'R') && !e.repeat) newRandomSystem();
      if ((e.key === 'm' || e.key === 'M') && !e.repeat) toggleSound();
      if ((e.key === 't' || e.key === 'T') && !e.repeat) setSettings((previous) => ({ ...previous, trajectoryPreview: !previous.trajectoryPreview }));
      if ((e.key === 'h' || e.key === 'H') && !e.repeat) toggleInterface();
      if ((e.key === 'f' || e.key === 'F') && !e.repeat) toggleFullScreen();
      if (e.code !== 'Space') return;
      // Also keeps the space bar from pressing the focused button (a skin, the settings' title)
      e.preventDefault();
      if (!e.repeat) setSpeed((current) => (current > 0 ? 0 : lastSpeed.current));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className={interfaceHidden ? 'App interface-hidden' : 'App'} data-skin={skinId}>
      <StarScene {...settings} skinId={skinId} system={system} />
      <SettingsPanel
        settings={settings}
        onChange={changeSetting}
        onRandomize={newRandomSystem}
        onReset={resetSettings}
        volume={soundOn ? volume : 0}
        onVolumeChange={changeVolume}
      />
      {/* The trophy between the sound and the skins: the volume slider, which unrolls on the left of the sound button,
          never moves it. Its board opens under it. */}
      <div className="top-bar">
        <SoundToggle on={soundOn} onToggle={toggleSound} volume={soundOn ? volume : 0} onVolumeChange={changeVolume} />
        <div className="achievements-control">
          <AchievementsButton unlocked={unlocked} open={boardOpen} onToggle={() => setBoardOpen((open) => !open)} />
          {boardOpen && <AchievementsBoard unlocked={unlocked} onClose={closeBoard} />}
        </div>
        <SkinSelector skinId={skinId} onSkinChange={changeSkin} />
      </div>
      <AchievementToasts toasts={toasts} />
      {/* Shown during the pause, even with the settings closed: a tap on it resumes the game too, for touch screens */}
      {speed === 0 && (
        <button type="button" className="paused" onClick={() => setSpeed(lastSpeed.current)}>
          Paused · Space or tap to resume
        </button>
      )}
      {/* While the interface is hidden: how to bring it back, shown for a moment then faded out */}
      {interfaceHidden && (
        <div key={hintCount} className="interface-hint">
          {document.fullscreenElement ? 'H: show interface · Esc: leave full screen' : 'H: show interface'}
        </div>
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
