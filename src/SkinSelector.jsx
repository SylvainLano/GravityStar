import React, { useEffect } from 'react';
import { skins } from './skins/skins';

// Round buttons to choose the skin, always visible in the top right corner, and the left and right arrow keys to go through the skins
function SkinSelector({ skinId, onSkinChange }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      // Arrows on a focused slider of the settings change the slider, not the skin
      if (!step || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, select, textarea')) return;
      const index = skins.findIndex((skin) => skin.id === skinId);
      onSkinChange(skins[(index + step + skins.length) % skins.length].id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [skinId, onSkinChange]);

  const current = skins.find((skin) => skin.id === skinId);

  return (
    <div className="skin-selector" role="radiogroup" aria-label="Skin">
      <span className="skin-name">{current.name}</span>
      {skins.map((skin) => (
        <button
          key={skin.id}
          type="button"
          role="radio"
          aria-checked={skin.id === skinId}
          aria-label={skin.name}
          title={`${skin.name} (← →: change skin)`}
          className={skin.id === skinId ? 'skin-swatch active' : 'skin-swatch'}
          style={{ background: `linear-gradient(135deg, ${skin.swatch[0]} 50%, ${skin.swatch[1]} 50%)` }}
          onClick={() => onSkinChange(skin.id)}
        />
      ))}
    </div>
  );
}

export default SkinSelector;
