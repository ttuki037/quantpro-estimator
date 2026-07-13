import React, { useState, useMemo } from 'react';
import { Save, Boxes } from 'lucide-react';
import { calcBlockBrick } from '../utils/calculations.js';
import { formatNumber, formatInteger } from '../utils/formatters.js';
import { useUnits } from '../hooks/useUnits.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const BLOCK_TYPES = [
  { value: 'brick', label: 'Brick', sub: '230×76mm' },
  { value: 'block', label: 'Block', sub: '440×215mm' },
  { value: 'hollow_block', label: 'Hollow Block', sub: '390×190mm' },
];

export default function BlockBrickCalc() {
  const { unit, lengthLabel } = useUnits();
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [inputs, setInputs] = useState({
    length: '',
    height: '',
    blockType: 'brick',
    mortarJoint: 10,
    walls: 1,
  });

  const set = (field) => (e) =>
    setInputs(prev => ({ ...prev, [field]: e.target.value }));

  const results = useMemo(() => {
    const { length, height, blockType, mortarJoint, walls } = inputs;
    if (!length || !height) return null;
    return calcBlockBrick({
      length: parseFloat(length),
      height: parseFloat(height),
      blockType,
      mortarJoint: parseFloat(mortarJoint) || 10,
      walls: parseInt(walls) || 1,
      unit,
    });
  }, [inputs, unit]);

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Block & Brick - ${now}`,
      type: 'blockbrick',
      unit,
      inputs: {
        length: `${inputs.length} ${lengthLabel}`,
        height: `${inputs.height} ${lengthLabel}`,
        blockType: inputs.blockType,
        mortarJoint: `${inputs.mortarJoint}mm`,
        walls: inputs.walls,
      },
      results,
    });
    showToast('Project saved successfully!', 'success');
  };

  return (
    <div>
      <Navbar title="Block & Brick Calculator" actionSlot={
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
              <div className="form-section-title">Wall Dimensions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Wall Length ({lengthLabel})</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="e.g. 5.0"
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
                  <label className="input-label">Wall Height ({lengthLabel})</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="e.g. 3.0"
                      min="0"
                      step="0.01"
                      value={inputs.height}
                      onChange={set('height')}
                      style={{ paddingRight: '36px' }}
                    />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Mortar Joint (mm)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="10"
                      min="5"
                      max="20"
                      step="1"
                      value={inputs.mortarJoint}
                      onChange={set('mortarJoint')}
                      style={{ paddingRight: '40px' }}
                    />
                    <span className="input-suffix">mm</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Number of Walls</label>
                  <input
                    type="number"
                    className="ruler-input"
                    placeholder="1"
                    min="1"
                    step="1"
                    value={inputs.walls}
                    onChange={set('walls')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Block Type</div>
              <div className="radio-cards">
                {BLOCK_TYPES.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.blockType === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, blockType: value }))}
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
              <strong>Tip:</strong> Quantities include 10% wastage allowance. Mortar mix ratio 1:6 (cement:sand).
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
                <Boxes size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Enter wall dimensions to see quantities</p>
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
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.blockCount)}</div>
                    <div className="result-label">Block Count (+10%)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.blocksPerM2, 1)}</div>
                    <div className="result-label">Blocks per m²</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.mortarVol, 3)}</div>
                    <div className="result-label">Mortar Volume (m³)</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.cementBags)}</div>
                    <div className="result-label">Cement Bags (50kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatInteger(results.sandKg)}</div>
                    <div className="result-label">Sand (kg)</div>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Block Type</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9375rem', textTransform: 'capitalize' }}>
                        {inputs.blockType.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Waste Allowance</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9375rem' }}>10%</div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={handleSave}
                  style={{ width: '100%' }}
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
          .calc-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
