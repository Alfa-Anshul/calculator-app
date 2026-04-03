import React from 'react';
import Key from './Key';
import './Keypad.css';

const LAYOUT = [
  [
    { label: 'AC', action: 'clear', variant: 'func' },
    { label: '+/-', action: 'toggle', variant: 'func' },
    { label: '%', action: 'percent', variant: 'func' },
    { label: '÷', action: 'op', value: '/', variant: 'op' }
  ],
  [
    { label: '7', action: 'digit', value: '7' },
    { label: '8', action: 'digit', value: '8' },
    { label: '9', action: 'digit', value: '9' },
    { label: '×', action: 'op', value: '*', variant: 'op' }
  ],
  [
    { label: '4', action: 'digit', value: '4' },
    { label: '5', action: 'digit', value: '5' },
    { label: '6', action: 'digit', value: '6' },
    { label: '−', action: 'op', value: '-', variant: 'op' }
  ],
  [
    { label: '1', action: 'digit', value: '1' },
    { label: '2', action: 'digit', value: '2' },
    { label: '3', action: 'digit', value: '3' },
    { label: '+', action: 'op', value: '+', variant: 'op' }
  ],
  [
    { label: '⌫', action: 'back', variant: 'func' },
    { label: '0', action: 'digit', value: '0' },
    { label: '.', action: 'digit', value: '.' },
    { label: '=', action: 'eval', variant: 'eq' }
  ]
];

export default function Keypad({ onDigit, onOperator, onEvaluate, onClear, onBackspace, onToggleSign, onPercent }) {
  const dispatch = (key) => {
    switch (key.action) {
      case 'digit': return onDigit(key.value);
      case 'op':    return onOperator(key.value);
      case 'eval':  return onEvaluate();
      case 'clear': return onClear();
      case 'back':  return onBackspace();
      case 'toggle': return onToggleSign();
      case 'percent': return onPercent();
    }
  };

  return (
    <div className="keypad">
      {LAYOUT.map((row, ri) => (
        <div key={ri} className="keypad-row">
          {row.map((key) => (
            <Key key={key.label} keyDef={key} onClick={() => dispatch(key)} />
          ))}
        </div>
      ))}
    </div>
  );
}
