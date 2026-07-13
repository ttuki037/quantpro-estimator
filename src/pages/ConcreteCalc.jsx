import React, { useState, useMemo } from 'react';
import { Save, Layers } from 'lucide-react';
import { calcConcrete } from '../utils/calculations.js';
import { formatNumber, formatInteger } from '../utils/formatters.js';
import { useUnits } from '../hooks/useUnits.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const MIX_RATIOS = [
  { value: '1:1.5:3', label: '1:1.5:3', sub: 'Rich mix' },
  { value: '1:2:4', label: '1:2:4', sub: 'Standard' },
  { value: '1:3:6', label: '1:3:6', sub: 'Lean mix' },
];

export default function ConcreteCalc() {
  const { unit, lengthLabel } = useUnits();
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    depth: '',
    slabs: 1,
    mixRatio: '1:2:4',
  });

  const set = (field) => (e) =>
    setInputs(prev => ({ ...prev, [field]: e.target.value }));

  const results = useMemo(() => {
    const { length, width, depth, slabs, mixRatio } = inputs;
    if (!length || !width || !depth) return null;
    return calcConcrete({
      length: parseFloat(length),
      width: parseFloat(width),
      depth: parseFloat(depth),
      slabs: parseInt(slabs) || 1,
      mixRatio,
      unit,
    });
  }, [inputs, unit]);

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Concrete - ${now}`,
      type: 'concrete',
      unit,
      inputs: {
        length: `${inputs.length} ${lengthLabel}`,
        width: `${inputs.width} ${lengthLabel}`,
        depth: `${inputs.depth} ${lengthLabel}`,
        slabs: inputs.slabs,
        mixRatio: inputs.mixRatio,
      },
      results,
    });
    showToast('Project saved successfully!', 'success');
  };

  return (
    <div>
      <Navbar title="Concrete Calculator" actionSlot={
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
              <div className="form-section-title">Dimensions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Length ({lengthLabel})</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="e.g. 6.0"
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
                      placeholder="e.g. 4.0"
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
                  <label className="input-label">Depth ({lengthLabel})</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="e.g. 0.15"
                      min="0"
                      step="0.01"
                      value={inputs.depth}
                      onChange={set('depth')}
                      style={{ paddingRight: '36px' }}
                    />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Number of Slabs</label>
                  <input
                    type="number"
                    className="ruler-input"
                    placeholder="1"
                    min="1"
                    step="1"
                    value={inputs.slabs}
                    onChange={set('slabs')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Mix Ratio</div>
              <div className="radio-cards">
                {MIX_RATIOS.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.mixRatio === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, mixRatio: value }))}
                  >
                    <span>{label}</span>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '14px 16px',
              background: 'var(--navy-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              color: 'var(--navy)',
              lineHeight: 1.5,
            }}>
              <strong>Tip:</strong> Depth in metres — for a 150mm slab, enter 0.15m. All quantities include a 54% dry volume uplift factor.
            </div>
          </div>

          {/* Results */}
          <div>
            {!results ? (
              <div className="card" style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}>
                <Layers size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Enter dimensions to see material quantities</p>
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
                    <div className="result-value">{formatNumber(results.volumeM3)}</div>
                    <div className="result-label">Wet Volume (m³)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.dryVolumeM3)}</div>
                    <div className="result-label">Dry Volume (m³)</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.cementBags50kg)}</div>
                    <div className="result-label">Cement Bags (50kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.cementKg, 1)}</div>
                    <div className="result-label">Cement (kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.sand_m3)}</div>
                    <div className="result-label">Sand (m³)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.sandKg, 0)}</div>
                    <div className="result-label">Sand (kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.aggregate_m3)}</div>
                    <div className="result-label">Aggregate (m³)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.aggregateKg, 0)}</div>
                    <div className="result-label">Aggregate (kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.water_L, 0)}</div>
                    <div className="result-label">Water (litres)</div>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Mix Ratio</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{results.mixRatio}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Volume Factor</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>×1.54</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>W/C Ratio</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>0.50</div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={handleSave}
                  style={{ width: '100%', marginTop: '12px' }}
                >
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
          .calc-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
