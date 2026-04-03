import React, { useState } from 'react';
import './Key.css';

export default function Key({ keyDef, onClick }) {
  const [pressed, setPressed] = useState(false);

  const handleDown = () => setPressed(true);
  const handleUp = () => { setPressed(false); onClick(); };

  const variantClass = keyDef.variant
    ? `key--${keyDef.variant}`
    : 'key--num';

  return (
    <button
      className={`key ${variantClass} ${pressed ? 'key--pressed' : ''}`}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={() => setPressed(false)}
    >
      {keyDef.label}
    </button>
  );
}
