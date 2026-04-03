import React, { useState, useCallback, useEffect, useRef } from 'react';
import './Calculator.css';

const MAX_DIGITS = 15;

// ripple helper
function spawnRipple(el) {
  const r = document.createElement('span');
  r.className = 'ripple';
  el.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

const SCI_BUTTONS = [
  { label: 'sin', fn: v => Math.sin(v * Math.PI / 180) },
  { label: 'cos', fn: v => Math.cos(v * Math.PI / 180) },
  { label: 'tan', fn: v => Math.tan(v * Math.PI / 180) },
  { label: 'log', fn: v => Math.log10(v) },
  { label: 'ln',  fn: v => Math.log(v) },
  { label: '√',   fn: v => Math.sqrt(v) },
  { label: 'x²',  fn: v => v * v },
  { label: 'x³',  fn: v => v * v * v },
  { label: '1/x', fn: v => 1 / v },
  { label: 'π',   fn: () => Math.PI },
  { label: 'e',   fn: () => Math.E },
  { label: '(',   fn: null, sym: '(' },
  { label: ')',   fn: null, sym: ')' },
  { label: 'x!',  fn: v => { let r=1; for(let i=2;i<=Math.round(v);i++) r*=i; return r; } },
  { label: 'EXP', fn: null, sym: 'e' },
  { label: '±',   fn: v => -v },
];

const BASIC_ROWS = [
  [
    { label: 'AC',  action: 'clear',   cls: 'func' },
    { label: '+/-', action: 'toggle',  cls: 'func' },
    { label: '%',   action: 'percent', cls: 'func' },
    { label: '÷',   action: 'op', value: '/', cls: 'op' },
  ],
  [
    { label: '7', action: 'digit', value: '7' },
    { label: '8', action: 'digit', value: '8' },
    { label: '9', action: 'digit', value: '9' },
    { label: '×', action: 'op', value: '*', cls: 'op' },
  ],
  [
    { label: '4', action: 'digit', value: '4' },
    { label: '5', action: 'digit', value: '5' },
    { label: '6', action: 'digit', value: '6' },
    { label: '−', action: 'op', value: '-', cls: 'op' },
  ],
  [
    { label: '1', action: 'digit', value: '1' },
    { label: '2', action: 'digit', value: '2' },
    { label: '3', action: 'digit', value: '3' },
    { label: '+', action: 'op', value: '+', cls: 'op' },
  ],
  [
    { label: '⌫', action: 'back',  cls: 'func' },
    { label: '0', action: 'digit', value: '0' },
    { label: '.', action: 'digit', value: '.' },
    { label: '=', action: 'eval',  cls: 'eq' },
  ],
];

export default function Calculator() {
  const [expr, setExpr]       = useState('');
  const [display, setDisplay] = useState('0');
  const [done, setDone]       = useState(false);
  const [mode, setMode]       = useState('basic'); // basic | sci
  const [flash, setFlash]     = useState(false);
  const [history, setHistory] = useState([]);
  const [showHist, setShowHist] = useState(false);
  const displayRef = useRef(null);

  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }, []);

  const pushDigit = useCallback((d) => {
    if (done) { setDisplay(d); setExpr(d); setDone(false); return; }
    if (display === '0' && d !== '.') {
      setDisplay(d); setExpr(e => e === '' ? d : e.slice(0,-1) + d);
    } else {
      if (display.replace(/\D/g,'').length >= MAX_DIGITS) return;
      setDisplay(p => p + d); setExpr(p => p + d);
    }
  }, [display, done]);

  const pushOp = useCallback((op) => {
    setDone(false);
    const last = expr.slice(-1);
    if (['+','-','*','/'].includes(last)) {
      setExpr(p => p.slice(0,-1) + op);
    } else {
      setExpr(p => p + op);
    }
    setDisplay(op);
  }, [expr]);

  const evaluate = useCallback(() => {
    if (!expr) return;
    try {
      const san = expr.replace(/[^0-9+\-*/().e]/g,'');
      // eslint-disable-next-line no-new-func
      const res = Function('"use strict"; return (' + san + ')')();
      if (!isFinite(res)) { setDisplay('Error'); setExpr(''); return; }
      const fmt = parseFloat(res.toPrecision(12)).toString();
      setHistory(h => [`${expr} = ${fmt}`, ...h].slice(0,20));
      setDisplay(fmt); setExpr(fmt); setDone(true);
      triggerFlash();
    } catch { setDisplay('Error'); setExpr(''); }
  }, [expr, triggerFlash]);

  const clear   = useCallback(() => { setDisplay('0'); setExpr(''); setDone(false); }, []);
  const back    = useCallback(() => {
    if (done) { clear(); return; }
    setDisplay(p => p.length <= 1 ? '0' : p.slice(0,-1));
    setExpr(p => p.length <= 1 ? '' : p.slice(0,-1));
  }, [done, clear]);
  const toggle  = useCallback(() => {
    const v = parseFloat(display); if (isNaN(v)) return;
    const t = (-v).toString(); setDisplay(t);
    setExpr(p => p.replace(/(-?[\d.]+)$/, t));
  }, [display]);
  const percent = useCallback(() => {
    const v = parseFloat(display); if (isNaN(v)) return;
    const r = (v/100).toString(); setDisplay(r);
    setExpr(p => p.replace(/(-?[\d.]+)$/, r));
  }, [display]);

  const applySci = useCallback((btn) => {
    if (btn.sym) {
      setExpr(p => p + btn.sym); setDisplay(btn.sym); setDone(false); return;
    }
    const v = parseFloat(display);
    if (isNaN(v)) return;
    const res = btn.fn(v);
    const fmt = parseFloat(res.toPrecision(12)).toString();
    setDisplay(fmt); setExpr(fmt); setDone(true); triggerFlash();
  }, [display, triggerFlash]);

  const dispatch = useCallback((key) => {
    switch (key.action) {
      case 'digit':   return pushDigit(key.value);
      case 'op':      return pushOp(key.value);
      case 'eval':    return evaluate();
      case 'clear':   return clear();
      case 'back':    return back();
      case 'toggle':  return toggle();
      case 'percent': return percent();
    }
  }, [pushDigit, pushOp, evaluate, clear, back, toggle, percent]);

  // keyboard support
  useEffect(() => {
    const handler = (e) => {
      if ('0123456789.'.includes(e.key)) pushDigit(e.key);
      else if (['+','-','*','/'].includes(e.key)) pushOp(e.key);
      else if (e.key === 'Enter' || e.key === '=') evaluate();
      else if (e.key === 'Backspace') back();
      else if (e.key === 'Escape') clear();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pushDigit, pushOp, evaluate, back, clear]);

  const len = display.length;
  const fs  = len > 14 ? '1.1rem' : len > 10 ? '1.5rem' : len > 7 ? '2rem' : '2.8rem';

  return (
    <div className={`calc ${mode === 'sci' ? 'calc--sci' : ''}`}>
      {/* header */}
      <div className="calc__header">
        <span className="calc__brand">ANERVEA<span className="blink">_</span></span>
        <div className="calc__header-btns">
          <button className="hbtn" onClick={() => setShowHist(p=>!p)} title="History">⏱</button>
          <button className={`hbtn ${mode==='sci'?'hbtn--active':''}`}
            onClick={() => setMode(m => m==='basic'?'sci':'basic')} title="Scientific">
            ∫
          </button>
        </div>
      </div>

      {/* history drawer */}
      {showHist && (
        <div className="hist">
          {history.length === 0 && <div className="hist__empty">no history yet</div>}
          {history.map((h,i) => <div key={i} className="hist__item">{h}</div>)}
        </div>
      )}

      {/* display */}
      <div className={`calc__display ${flash ? 'calc__display--flash' : ''}`} ref={displayRef}>
        <div className="calc__expr">{expr || '\u00A0'}</div>
        <div className="calc__val" style={{fontSize: fs}}>{display}</div>
        <div className="calc__cursor" />
      </div>

      {/* scientific grid */}
      {mode === 'sci' && (
        <div className="sci-grid">
          {SCI_BUTTONS.map(btn => (
            <button key={btn.label} className="key key--sci"
              onPointerDown={e => { e.currentTarget.classList.add('key--down'); spawnRipple(e.currentTarget); }}
              onPointerUp={e => { e.currentTarget.classList.remove('key--down'); applySci(btn); }}
              onPointerLeave={e => e.currentTarget.classList.remove('key--down')}>
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* basic keypad */}
      <div className="basic-grid">
        {BASIC_ROWS.map((row, ri) => (
          <div key={ri} className="basic-row">
            {row.map(key => (
              <button key={key.label}
                className={`key key--${key.cls || 'num'}`}
                onPointerDown={e => { e.currentTarget.classList.add('key--down'); spawnRipple(e.currentTarget); }}
                onPointerUp={e => { e.currentTarget.classList.remove('key--down'); dispatch(key); }}
                onPointerLeave={e => e.currentTarget.classList.remove('key--down')}>
                {key.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
