import React, { useState, useMemo } from 'react';
import { Save, Paintbrush } from 'lucide-react';
import { calcPaint } from '../utils/calculations.js';
import { formatNumber } from '../utils/formatters.js';
import { useUnits } from '../hooks/useUnits.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const COATS = [
  { value: 1, label: '1 Coat', sub: 'Touch-up' },
  { value: 2, label: '2 Coats', sub: 'Standard' },
  { value: 3, label: '3 Coats', sub: 'Full cover' },
];

const PAINT_TYPES = [
  { value: 'emulsion', label: 'Emulsion', sub: '10 m²/L' },
  { value: 'gloss', label: 'Gloss', sub: '12 m²/L' },
  { value: 'satinwood', label: 'Satinwood', sub: '11 m²/L' },
];

export default function PaintCalc() {
  const { unit, lengthLabel } = useUnits();
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    height: '',
    doors: 0,
    windows: 0,
    coats: 2,
    paintType: 'emulsion',
    includeCeiling: false,
    includePrimer: true,
  });

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInputs(prev => ({ ...prev, [field]: val }));
  };

  const results = useMemo(() => {
    const { length, width, height, doors, windows, coats, paintType, includeCeiling, includePrimer } = inputs;
    if (!length || !width || !height) return null;
    return calcPaint({
      length: parseFloat(length),
      width: parseFloat(width),
      height: parseFloat(height),
      doors: parseInt(doors) || 0,
      windows: parseInt(windows) || 0,
      coats: parseInt(coats),
      paintType,
      includeCeiling,
      includePrimer,
      unit,
    });
  }, [inputs, unit]);

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Paint - ${now}`,
      type: 'paint',
      unit,
      inputs: {
        length: `${inputs.length} ${lengthLabel}`,
        width: `${inputs.width} ${lengthLabel}`,
        height: `${inputs.height} ${lengthLabel}`,
        doors: inputs.doors,
        windows: inputs.windows,
        coats: inputs.coats,
        paintType: inputs.paintType,
        includeCeiling: inputs.includeCeiling,
        includePrimer: inputs.includePrimer,
      },
      results,
    });
    showToast('Project saved successfully!', 'success');
  };

  return (
    <div>
      <Navbar title="Paint Calculator" actionSlot={
        results && (
          <button className="btn-primary btn-sm" onClick={handleSave}>
            <Save size={14} />
            Save Project
          </button>
        )
      } />

      <div style={{ padding: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start',
        }} className="calc-layout">
          {/* Inputs */}
          <div className="card" style={{ padding: '28px' }}>
            <div className="form-section">
              <div className="form-section-title">Room Dimensions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Length ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 5.0" min="0" step="0.01" value={inputs.length} onChange={set('length')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Width ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 4.0" min="0" step="0.01" value={inputs.width} onChange={set('width')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Ceiling Height ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 2.4" min="0" step="0.01" value={inputs.height} onChange={set('height')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Deductions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Doors (1.8 m² each)</label>
                  <input type="number" className="ruler-input" placeholder="0" min="0" max="10" step="1" value={inputs.doors} onChange={set('doors')} />
                </div>
                <div>
                  <label className="input-label">Windows (1.2 m² each)</label>
                  <input type="number" className="ruler-input" placeholder="0" min="0" max="10" step="1" value={inputs.windows} onChange={set('windows')} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Number of Coats</div>
              <div className="radio-cards">
                {COATS.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.coats === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, coats: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Paint Type</div>
              <div className="radio-cards">
                {PAINT_TYPES.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.paintType === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, paintType: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-title">Options</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { field: 'includeCeiling', label: 'Include Ceiling' },
                  { field: 'includePrimer', label: 'Include Primer Coat' },
                ].map(({ field, label }) => (
                  <label key={field} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    color: 'var(--text)',
                    fontWeight: 500,
                  }}>
                    <input
                      type="checkbox"
                      checked={inputs[field]}
                      onChange={set(field)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--orange)',
                        cursor: 'pointer',
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {!results ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Paintbrush size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Enter room dimensions to calculate paint</p>
              </div>
            ) : (
              <div className="animate-fadeInUp">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.wallArea)}</div>
                    <div className="result-label">Wall Area (m²)</div>
                  </div>
                  {inputs.includeCeiling && (
                    <div className="result-card">
                      <div className="result-value">{formatNumber(results.ceilingArea)}</div>
                      <div className="result-label">Ceiling Area (m²)</div>
                    </div>
                  )}
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.totalArea)}</div>
                    <div className="result-label">Total Paintable (m²)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.deductions)}</div>
                    <div className="result-label">Deductions (m²)</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatNumber(results.paintLitres, 1)}</div>
                    <div className="result-label">Paint Required (L)</div>
                  </div>
                  {inputs.includePrimer && (
                    <div className="result-card">
                      <div className="result-value">{formatNumber(results.primerLitres, 1)}</div>
                      <div className="result-label">Primer Required (L)</div>
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Coats</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{results.coats}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Coverage</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{results.coveragePerLitre} m²/L</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Type</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem', textTransform: 'capitalize' }}>{inputs.paintType}</div>
                    </div>
                  </div>
                </div>

                <button className="btn-secondary" onClick={handleSave} style={{ width: '100%' }}>
                  <Save size={16} />
                  Save to Projects
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calc-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
