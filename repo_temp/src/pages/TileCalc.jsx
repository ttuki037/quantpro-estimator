import React, { useState, useMemo } from 'react';
import { Save, Grid3x3 } from 'lucide-react';
import { calcFloorTile } from '../utils/calculations.js';
import { formatNumber, formatInteger } from '../utils/formatters.js';
import { useUnits } from '../hooks/useUnits.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const PATTERNS = [
  { value: 'straight', label: 'Straight', sub: '10% waste' },
  { value: 'diagonal', label: 'Diagonal', sub: '15% waste' },
  { value: 'herringbone', label: 'Herringbone', sub: '20% waste' },
];

export default function TileCalc() {
  const { unit, lengthLabel } = useUnits();
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    tileLength: 600,
    tileWidth: 300,
    groutWidth: 3,
    pattern: 'straight',
    tilesPerBox: 10,
  });

  const set = (field) => (e) =>
    setInputs(prev => ({ ...prev, [field]: e.target.value }));

  const results = useMemo(() => {
    const { length, width, tileLength, tileWidth, groutWidth, pattern, tilesPerBox } = inputs;
    if (!length || !width) return null;
    return calcFloorTile({
      length: parseFloat(length),
      width: parseFloat(width),
      tileLength: parseFloat(tileLength) || 600,
      tileWidth: parseFloat(tileWidth) || 300,
      groutWidth: parseFloat(groutWidth) || 3,
      pattern,
      tilesPerBox: parseInt(tilesPerBox) || 10,
      unit,
    });
  }, [inputs, unit]);

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Floor Tile - ${now}`,
      type: 'tile',
      unit,
      inputs: {
        length: `${inputs.length} ${lengthLabel}`,
        width: `${inputs.width} ${lengthLabel}`,
        tileLength: `${inputs.tileLength}mm`,
        tileWidth: `${inputs.tileWidth}mm`,
        groutWidth: `${inputs.groutWidth}mm`,
        pattern: inputs.pattern,
        tilesPerBox: inputs.tilesPerBox,
      },
      results,
    });
    showToast('Project saved successfully!', 'success');
  };

  return (
    <div>
      <Navbar title="Floor & Tile Calculator" actionSlot={
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
                  <label className="input-label">Room Length ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 5.0" min="0" step="0.01" value={inputs.length} onChange={set('length')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Room Width ({lengthLabel})</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="e.g. 4.0" min="0" step="0.01" value={inputs.width} onChange={set('width')} style={{ paddingRight: '36px' }} />
                    <span className="input-suffix">{lengthLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Tile Dimensions (always mm)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Tile Length (mm)</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="600" min="50" step="1" value={inputs.tileLength} onChange={set('tileLength')} style={{ paddingRight: '40px' }} />
                    <span className="input-suffix">mm</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Tile Width (mm)</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="300" min="50" step="1" value={inputs.tileWidth} onChange={set('tileWidth')} style={{ paddingRight: '40px' }} />
                    <span className="input-suffix">mm</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Grout Joint (mm)</label>
                  <div className="input-group">
                    <input type="number" className="ruler-input" placeholder="3" min="1" max="20" step="0.5" value={inputs.groutWidth} onChange={set('groutWidth')} style={{ paddingRight: '40px' }} />
                    <span className="input-suffix">mm</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Tiles per Box</label>
                  <input type="number" className="ruler-input" placeholder="10" min="1" step="1" value={inputs.tilesPerBox} onChange={set('tilesPerBox')} />
                </div>
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-title">Laying Pattern</div>
              <div className="radio-cards">
                {PATTERNS.map(({ value, label, sub }) => (
                  <div
                    key={value}
                    className={`radio-card${inputs.pattern === value ? ' active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, pattern: value }))}
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
                <Grid3x3 size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Enter room dimensions to calculate tiles</p>
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
                    <div className="result-value">{formatNumber(results.floorArea)}</div>
                    <div className="result-label">Floor Area (m²)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.tilesPerM2, 1)}</div>
                    <div className="result-label">Tiles per m²</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.tileCount)}</div>
                    <div className="result-label">Total Tiles Needed</div>
                  </div>
                  <div className="result-card" style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
                    <div className="result-value" style={{ color: 'var(--orange)' }}>{formatInteger(results.boxCount)}</div>
                    <div className="result-label">Boxes Required</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{results.wastePct}%</div>
                    <div className="result-label">Waste Allowance</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.adhesiveKg, 1)}</div>
                    <div className="result-label">Adhesive (kg)</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{formatNumber(results.groutKg, 1)}</div>
                    <div className="result-label">Grout (kg)</div>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Tile Size</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9375rem' }}>
                        {inputs.tileLength}×{inputs.tileWidth}mm
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '4px' }}>Pattern</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9375rem', textTransform: 'capitalize' }}>{inputs.pattern}</div>
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
