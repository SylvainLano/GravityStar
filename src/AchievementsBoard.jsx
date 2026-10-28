import React, { useEffect, useRef, useState } from 'react';

import { achievements, getUnlocked, onUnlock } from './achievements';
import { playSound } from './audio/sound';

// How long a notification stays, when an achievement is unlocked
const toastLength = 4000; // ms

// The achievements unlocked so far, and the notifications of the latest ones (with a jingle in the skin's style,
// when the sound is on)
export function useAchievements() {
  const [unlocked, setUnlocked] = useState(getUnlocked);
  const [toasts, setToasts] = useState([]);
  const nextToast = useRef(0);
  useEffect(() => onUnlock((achievement) => {
    playSound('achievement');
    setUnlocked(getUnlocked());
    const id = nextToast.current++;
    setToasts((previous) => [...previous, { id, achievement }]);
    setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), toastLength);
  }), []);
  return { unlocked, toasts };
}

// The trophy, next to the sound button: opens the board of the achievements
export function AchievementsButton({ unlocked, open, onToggle }) {
  return (
    <button
      type="button"
      className="achievements-button"
      aria-expanded={open}
      aria-label="Achievements"
      title={`Achievements (${unlocked.size}/${achievements.length})`}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4h8v5a4 4 0 0 1-8 0z" fill="currentColor" />
        <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" />
        <path d="M12 13v4M8 20h8M10 17h4" />
      </svg>
    </button>
  );
}

// The board: a small grid of icons, every achievement but only as a silhouette until it is unlocked, without a word
// about it. Hovering (or focusing) an unlocked one shows its name and text under it.
export function AchievementsBoard({ unlocked, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="achievements-board" role="dialog" aria-label="Achievements">
      <div className="achievements-title">
        Achievements · {unlocked.size}/{achievements.length}
      </div>
      <ul className="achievements-list">
        {achievements.map((achievement) => (unlocked.has(achievement.id) ? (
          <li key={achievement.id} className="achievement" tabIndex={0} aria-label={`${achievement.name}: ${achievement.text}`}>
            <span className="achievement-icon" aria-hidden="true">{achievement.icon}</span>
            <span className="achievement-details" aria-hidden="true">
              <span className="achievement-icon">{achievement.icon}</span>
              <span>
                <span className="achievement-name">{achievement.name}</span>
                <span className="achievement-text">{achievement.text}</span>
              </span>
            </span>
          </li>
        ) : (
          <li key={achievement.id} className="achievement locked" aria-label="Locked">
            <span className="achievement-icon" aria-hidden="true">{achievement.icon}</span>
          </li>
        )))}
      </ul>
    </div>
  );
}

// The notifications of the achievements just unlocked, at the bottom of the screen
export function AchievementToasts({ toasts }) {
  return (
    <div className="achievement-toasts" aria-live="polite">
      {toasts.map(({ id, achievement }) => (
        <div key={id} className="achievement-toast">
          <span className="achievement-icon" aria-hidden="true">{achievement.icon}</span>
          <span>
            <span className="achievement-toast-label">Achievement unlocked</span>
            <span className="achievement-name">{achievement.name}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
