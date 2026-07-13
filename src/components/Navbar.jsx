import React from 'react';
import { useUnits } from '../hooks/useUnits.js';

export default function Navbar({ title, actionSlot }) {
  const { unit, setUnit } = useUnits();

  return (
    <div style={{
      height: '60px',
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <h1 style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: '1.125rem',
        color: 'var(--text)',
      }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="unit-toggle">
          <button
            className={unit === 'metric' ? 'active' : ''}
            onClick={() => setUnit('metric')}
          >
            Metric
          </button>
          <button
            className={unit === 'imperial' ? 'active' : ''}
            onClick={() => setUnit('imperial')}
          >
            Imperial
          </button>
        </div>
        {actionSlot && actionSlot}
      </div>
    </div>
  );
}
