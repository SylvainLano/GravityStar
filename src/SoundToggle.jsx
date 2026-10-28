import React from 'react';

// The speaker button, next to the skins: switches the sound on and off (also with the M key).
// Hovering it, or moving the keyboard focus to it, unrolls a volume slider on its left (the same as in the settings).
function SoundToggle({ on, onToggle, volume, onVolumeChange }) {
  return (
    <div className="sound-control">
      <button
        type="button"
        className="sound-toggle"
        aria-pressed={on}
        aria-label="Sound"
        title={on ? 'Sound on (M: mute)' : 'Sound off (M: sound on)'}
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
          {on ? (
            <>
              <path d="M16 9a4 4 0 0 1 0 6" />
              <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
            </>
          ) : (
            <path d="M16 9l5 6M21 9l-5 6" />
          )}
        </svg>
      </button>
      <input
        type="range"
        className="volume-slider"
        aria-label="Volume"
        title={`Volume: ${volume}`}
        min={0}
        max={10}
        step={1}
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default SoundToggle;
