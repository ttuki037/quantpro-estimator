import React, { useState, useMemo } from 'react';
import { Save, Home as HomeIcon } from 'lucide-react';
import { calcRoofing } from '../utils/calculations.js';
import { formatNumber, formatInteger } from '../utils/formatters.js';
import { useUnits } from '../hooks/useUnits.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const ROOF_TYPES = [
  { value: 'gable', label: 'Gable', sub: 'Two slopes' },
  { value: 'hip', label: 'Hip', sub: 'Four slopes' },
  { value: 'lean_to', label: 'Lean-To', sub: 'Single slope' },
  { value: 'flat', label: 'Flat', sub: 'Low pitch' },
];

const MATERIALS = [
  { value: 'concrete_tiles', label: 'Concrete Tiles', sub: '10/m²' },
  { value: 'clay_tiles', label: 'Clay Tiles', sub: '12/m²' },
  { value: 'metal_sheets', label: 'Metal Sheets', sub: '0.5/m²' },
  { value: 'asphalt_shingles', label: 'Asphalt', sub: '7/m²' },
];

export default function RoofingCalc() {
  const { unit, lengthLabel } = useUnits();
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    pitch: 30,
    roofType: 'gable',
    material: 'concrete_tiles',
  });

  const set = (field) => (e) =>
    setInputs(prev => ({ ...prev, [field]: e.target.value }));

  const results = useMemo(() => {
    const { length, width, pitch, roofType, material } = inputs;
    if (!length || !width) return null;
    return calcRoofing({
      length: parseFloat(length),
      width: parseFloat(width),
      pitch: parseFloat(pitch) || 30,
      roofType,
      material,
      unit,
    });
  }, [inputs, unit]);

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Roofing - ${now}`,
      type: 'roofing',
      unit,
      inputs: {
        length: `${inputs.length} ${lengthLabel}`,
        width: `${inputs.width} ${lengthLabel}`,
        pitch: `${inputs.pitch}°`,
        roofType: inputs.roofType,
        material: inputs.material,
      },
      results,
    });
    showToast('Project saved successfully!', 'success');
  };

  return (
    <div>
      <Navbar title="Roofing Calculator" actionSlot={
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
              <div className="form-section-title">Roof Plan Dimensions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Length ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 12.0" min="0" step="0.01" value={inputs.length} onChange={set('length')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Width ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 8.0" min="0" step="0.01" value={inputs.width} onChange={set('width')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Roof Pitch</div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={inputs.pitch}
                  onChange={set('pitch')}
                  style={{
                    flex: 1,
                    accentColor: 'var(--orange)',
                    height: '6px',
                    cursor: 'pointer',
                  }}
                />
                <div className="input-group" style={{ width: '100px', flexShrink: 0 }}>
                  <input
                    type="number"
                    className="ruler-input"
                    min="0"
                    max="60"
                    step="1"
                    value={inputs.pitch}
                    onChange={set('pitch')}
                    style={{ paddingRight: '28px', textAlign: 'center' }}
                  />
                  <span className="input-suffix">°</span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '6px',
              }}>
                <span>Flat (0°)</span>
                <span>Steep (60°)</span>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Roof Type</div>
              <div className="radio-cards">
                {ROOF_TYPES.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.roofType === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, roofType: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-title">Roofing Material</div>
              <div className="radio-cards">
                {MATERIALS.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.material === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, material: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {!results ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <HomeIcon size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Enter roof dimensions to calculate materials</p>
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
                    <div className="result-value">{formatNumber(results.footprintArea)}</div>
                    <div className="result-label">Footprint Area (m²)</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatNumber(results.roofArea)}</div>
                    <div className="result-label">Roof Area (m²)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.pitchFactor, 3)}</div>
                    <div className="result-label">Pitch Factor</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.unitCount)}</div>
                    <div className="result-label">{results.unitName.charAt(0).toUpperCase() + results.unitName.slice(1)} Count</div>
                  </div>
                  {results.ridgingM > 0 && (
                    <div className="result-card">
                      <div className="result-value">{formatNumber(results.ridgingM)}</div>
                      <div className="result-label">Ridging (m)</div>
                    </div>
                  )}
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.flashingM)}</div>
                    <div className="result-label">Flashing (m)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.underlayM2)}</div>
                    <div className="result-label">Underlay (m²)</div>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Pitch</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{inputs.pitch}°</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Roof Type</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.875rem', textTransform: 'capitalize' }}>{inputs.roofType.replace('_', '-')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Waste</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>10%</div>
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
