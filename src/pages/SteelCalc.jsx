import React, { useState, useMemo } from 'react';
import { Save, Ruler } from 'lucide-react';
import { calcSteel } from '../utils/calculations.js';
import { formatNumber, formatInteger } from '../utils/formatters.js';
import { useUnits } from '../hooks/useUnits.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const BAR_DIAMETERS = [
  { value: 8, label: 'T8', sub: '8mm' },
  { value: 10, label: 'T10', sub: '10mm' },
  { value: 12, label: 'T12', sub: '12mm' },
  { value: 16, label: 'T16', sub: '16mm' },
  { value: 20, label: 'T20', sub: '20mm' },
  { value: 25, label: 'T25', sub: '25mm' },
];

const SPACINGS = [
  { value: 100, label: '100mm', sub: 'Heavy' },
  { value: 150, label: '150mm', sub: 'Standard' },
  { value: 200, label: '200mm', sub: 'Light' },
  { value: 250, label: '250mm', sub: 'Sparse' },
];

export default function SteelCalc() {
  const { unit, lengthLabel } = useUnits();
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    spacing: 150,
    barDiameter: 12,
    layers: 1,
  });

  const set = (field) => (e) =>
    setInputs(prev => ({ ...prev, [field]: e.target.value }));

  const results = useMemo(() => {
    const { length, width, spacing, barDiameter, layers } = inputs;
    if (!length || !width) return null;
    return calcSteel({
      length: parseFloat(length),
      width: parseFloat(width),
      spacing: parseFloat(spacing) || 150,
      barDiameter: parseFloat(barDiameter) || 12,
      layers: parseInt(layers) || 1,
      unit,
    });
  }, [inputs, unit]);

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Steel Rebar - ${now}`,
      type: 'steel',
      unit,
      inputs: {
        length: `${inputs.length} ${lengthLabel}`,
        width: `${inputs.width} ${lengthLabel}`,
        barDiameter: `T${inputs.barDiameter} (${inputs.barDiameter}mm)`,
        spacing: `${inputs.spacing}mm`,
        layers: inputs.layers,
      },
      results,
    });
    showToast('Project saved successfully!', 'success');
  };

  return (
    <div>
      <Navbar title="Steel Rebar Calculator" actionSlot={
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
              <div className="form-section-title">Slab / Element Dimensions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Length ({lengthLabel})</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="e.g. 8.0"
                      min="0"
                      step="0.01"
                      value={inputs.length}
                      onChange={set('length')}
                      style={{ paddingRight: '36px' }}
                    />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Width ({lengthLabel})</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="e.g. 5.0"
                      min="0"
                      step="0.01"
                      value={inputs.width}
                      onChange={set('width')}
                      style={{ paddingRight: '36px' }}
                    />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Reinforcement Layers</label>
                  <input
                    type="number"
                    className="ruler-input"
                    placeholder="1"
                    min="1"
                    max="4"
                    step="1"
                    value={inputs.layers}
                    onChange={set('layers')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Bar Diameter</div>
              <div className="radio-cards">
                {BAR_DIAMETERS.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${Number(inputs.barDiameter) === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, barDiameter: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-title">Bar Spacing</div>
              <div className="radio-cards">
                {SPACINGS.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${Number(inputs.spacing) === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, spacing: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px' }}>
                <label className="input-label">Custom Spacing (mm)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="ruler-input"
                    placeholder="e.g. 175"
                    min="50"
                    max="500"
                    step="25"
                    value={inputs.spacing}
                    onChange={set('spacing')}
                    style={{ paddingRight: '40px' }}
                  />
                  <span className="input-suffix">mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {!results ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Ruler size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Enter slab dimensions to calculate reinforcement</p>
              </div>
            ) : (
              <div className="animate-fadeInUp">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.totalBars)}</div>
                    <div className="result-label">Total Bars</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatInteger(results.barsX)}</div>
                    <div className="result-label">Bars (X-dir)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatInteger(results.barsY)}</div>
                    <div className="result-label">Bars (Y-dir)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.totalLengthM)}</div>
                    <div className="result-label">Total Length (m)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.totalLengthX)}</div>
                    <div className="result-label">X-Length (m)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.totalLengthY)}</div>
                    <div className="result-label">Y-Length (m)</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatNumber(results.weightKg, 0)}</div>
                    <div className="result-label">Total Weight (kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.tonnage, 3)}</div>
                    <div className="result-label">Tonnage (t)</div>
                  </div>
                </div>

                {/* Summary card */}
                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Bar Size</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>T{results.barDiameter}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Spacing</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{results.spacing}mm</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Layers</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{results.layers}</div>
                    </div>
                  </div>
                </div>

                {/* Tip */}
                <div style={{
                  padding: '14px 16px',
                  background: 'var(--navy-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  color: 'var(--navy)',
                  lineHeight: 1.5,
                  marginBottom: '12px',
                }}>
                  <strong>Note:</strong> Add laps (typically 40×bar diameter) and wastage (5–10%) to the total length for ordering purposes.
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
