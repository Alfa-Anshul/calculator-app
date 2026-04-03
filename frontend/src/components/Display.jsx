import React from 'react';
import './Display.css';

export default function Display({ value, expression }) {
  // Shrink font if long
  const len = String(value).length;
  const fontSize = len > 9 ? '2rem' : len > 6 ? '2.8rem' : '3.6rem';

  return (
    <div className="display">
      <div className="expression">{expression || '\u00A0'}</div>
      <div className="main-value" style={{ fontSize }}>{value}</div>
    </div>
  );
}
