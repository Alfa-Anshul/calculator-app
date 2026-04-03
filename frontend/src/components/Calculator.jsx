import React, { useState, useCallback } from 'react';
import Display from './Display';
import Keypad from './Keypad';
import './Calculator.css';

const MAX_DIGITS = 12;

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handleDigit = useCallback((digit) => {
    if (justEvaluated) {
      setDisplay(digit);
      setExpression(digit);
      setJustEvaluated(false);
      return;
    }
    if (display === '0' && digit !== '.') {
      setDisplay(digit);
      setExpression((prev) => (prev === '' ? digit : prev.slice(0, -1) + digit));
    } else {
      if (display.replace(/[^0-9]/g, '').length >= MAX_DIGITS) return;
      setDisplay((prev) => prev + digit);
      setExpression((prev) => prev + digit);
    }
  }, [display, justEvaluated]);

  const handleOperator = useCallback((op) => {
    setJustEvaluated(false);
    const last = expression.slice(-1);
    const isLastOp = ['+', '-', '*', '/'].includes(last);
    if (isLastOp) {
      setExpression((prev) => prev.slice(0, -1) + op);
    } else {
      setExpression((prev) => prev + op);
    }
    setDisplay(op);
  }, [expression]);

  const handleEvaluate = useCallback(() => {
    if (!expression) return;
    try {
      // Safe eval: only allow digits and operators
      const sanitised = expression.replace(/[^0-9+\-*/().]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + sanitised + ')')();
      if (!isFinite(result)) {
        setDisplay('Error');
        setExpression('');
      } else {
        const formatted = parseFloat(result.toPrecision(10)).toString();
        setDisplay(formatted);
        setExpression(formatted);
        setJustEvaluated(true);
      }
    } catch {
      setDisplay('Error');
      setExpression('');
    }
  }, [expression]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setJustEvaluated(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (justEvaluated) { handleClear(); return; }
    setDisplay((prev) => prev.length <= 1 ? '0' : prev.slice(0, -1));
    setExpression((prev) => prev.length <= 1 ? '' : prev.slice(0, -1));
  }, [justEvaluated, handleClear]);

  const handleToggleSign = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const toggled = (-val).toString();
    setDisplay(toggled);
    setExpression((prev) => {
      const stripped = prev.replace(/(-?[\d.]+)$/, toggled);
      return stripped;
    });
  }, [display]);

  const handlePercent = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const result = (val / 100).toString();
    setDisplay(result);
    setExpression((prev) => prev.replace(/(-?[\d.]+)$/, result));
  }, [display]);

  return (
    <div className="calc-shell">
      <Display value={display} expression={expression} />
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onEvaluate={handleEvaluate}
        onClear={handleClear}
        onBackspace={handleBackspace}
        onToggleSign={handleToggleSign}
        onPercent={handlePercent}
      />
    </div>
  );
}
