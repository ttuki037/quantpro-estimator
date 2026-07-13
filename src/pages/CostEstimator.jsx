import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, Save, Calculator, ChevronDown, ChevronUp,
} from 'lucide-react';
import { calcCost } from '../utils/calculations.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';

const CATEGORIES = ['Materials', 'Labour', 'Equipment', 'Overhead'];

const CURRENCIES = [
  { value: 'GBP', label: '£ GBP' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

function newItem() {
  return {
    id: crypto.randomUUID(),
    description: '',
    category: 'Materials',
    quantity: '',
    unit: 'm²',
    unitPrice: '',
  };
}

export default function CostEstimator() {
  const { saveProject } = useProjects();
  const { showToast } = useToast();

  const [items, setItems] = useState([newItem()]);
  const [markup, setMarkup] = useState(0);
  const [contingency, setContingency] = useState(5);
  const [vatRate, setVatRate] = useState(20);
  const [currency, setCurrency] = useState('GBP');
  const [showBreakdown, setShowBreakdown] = useState(true);

  const validItems = useMemo(() =>
    items.filter(i => i.description && i.quantity && i.unitPrice),
    [items]
  );

  const results = useMemo(() => {
    if (validItems.length === 0) return null;
    return calcCost({
      items: validItems,
      markup: parseFloat(markup) || 0,
      contingency: parseFloat(contingency) || 0,
      vatRate: parseFloat(vatRate) || 0,
      currency,
    });
  }, [validItems, markup, contingency, vatRate, currency]);

  const sym = CURRENCY_SYMBOLS[currency] || '£';

  const addItem = () => setItems(prev => [...prev, newItem()]);

  const removeItem = (id) => {
    if (items.length === 1) {
      setItems([newItem()]);
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handleSave = () => {
    if (!results) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    saveProject({
      name: `Cost Estimate - ${now}`,
      type: 'cost',
      unit: 'metric',
      inputs: {
        lineItems: validItems.length,
        markup: `${markup}%`,
        contingency: `${contingency}%`,
        vat: `${vatRate}%`,
        currency,
      },
      results: {
        grandTotal: results.grandTotal,
        subtotal: results.subtotal,
        vatAmt: results.vatAmt,
        markupAmt: results.markupAmt,
        contingencyAmt: results.contingencyAmt,
      },
    });
    showToast('Project saved successfully!', 'success');
  };

  const itemTotal = (item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.unitPrice) || 0;
    return q * p;
  };

  return (
    <div>
      <Navbar title="Cost Estimator" actionSlot={
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
          gridTemplateColumns: '3fr 2fr',
          gap: '24px',
          alignItems: 'start',
        }} className="cost-layout">

          {/* Left: Line items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header controls */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: 0 }}>Line Items</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label className="input-label" style={{ margin: 0 }}>Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="ruler-input"
                    style={{ width: '100px', padding: '6px 10px', fontSize: '0.875rem' }}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 120px 80px 80px 80px 36px',
                gap: '8px',
                marginBottom: '8px',
                padding: '0 2px',
              }}>
                {['Description', 'Category', 'Qty', `Unit (${sym})`, 'Total', ''].map((h, i) => (
                  <div key={i} style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>{h}</div>
                ))}
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 120px 80px 80px 80px 36px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                    className="cost-row"
                  >
                    <input
                      type="text"
                      className="ruler-input"
                      placeholder={`Item ${idx + 1}`}
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      style={{ fontSize: '0.875rem', padding: '8px 12px' }}
                    />
                    <select
                      value={item.category}
                      onChange={e => updateItem(item.id, 'category', e.target.value)}
                      className="ruler-input"
                      style={{ fontSize: '0.8125rem', padding: '8px 10px' }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      style={{ fontSize: '0.875rem', padding: '8px 10px' }}
                    />
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                      style={{ fontSize: '0.875rem', padding: '8px 10px' }}
                    />
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: itemTotal(item) > 0 ? 'var(--navy)' : 'var(--text-light)',
                      padding: '8px 4px',
                      textAlign: 'right',
                    }}>
                      {itemTotal(item) > 0
                        ? `${sym}${formatNumber(itemTotal(item))}`
                        : '—'
                      }
                    </div>
                    <button
                      className="btn-icon"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="btn-ghost"
                onClick={addItem}
                style={{ marginTop: '16px', width: '100%', gap: '8px' }}
              >
                <Plus size={16} />
                Add Line Item
              </button>
            </div>

            {/* Category breakdown */}
            {results && (
              <div className="card" style={{ padding: '20px' }}>
                <button
                  onClick={() => setShowBreakdown(b => !b)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    marginBottom: showBreakdown ? '16px' : 0,
                  }}
                >
                  <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: 0, color: 'var(--navy)' }}>
                    Category Breakdown
                  </h2>
                  {showBreakdown ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>

                {showBreakdown && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {Object.entries(results.categories)
                      .filter(([, v]) => v > 0)
                      .map(([cat, val]) => {
                        const pct = results.subtotal > 0 ? (val / results.subtotal) * 100 : 0;
                        return (
                          <div key={cat} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 0',
                            borderBottom: '1px solid var(--border)',
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px',
                              }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{cat}</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy)' }}>
                                  {sym}{formatNumber(val)}
                                </span>
                              </div>
                              <div style={{
                                height: '4px',
                                background: 'var(--border)',
                                borderRadius: '999px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: 'var(--navy)',
                                  borderRadius: '999px',
                                  transition: 'width 0.4s ease',
                                }} />
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              minWidth: '36px',
                              textAlign: 'right',
                            }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Settings + Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Settings */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: '16px' }}>Adjustments</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="input-label">Markup (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="0"
                      min="0"
                      max="200"
                      step="0.5"
                      value={markup}
                      onChange={e => setMarkup(e.target.value)}
                      style={{ paddingRight: '32px' }}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Contingency (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="5"
                      min="0"
                      max="50"
                      step="0.5"
                      value={contingency}
                      onChange={e => setContingency(e.target.value)}
                      style={{ paddingRight: '32px' }}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">VAT Rate (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="ruler-input"
                      placeholder="20"
                      min="0"
                      max="100"
                      step="0.5"
                      value={vatRate}
                      onChange={e => setVatRate(e.target.value)}
                      style={{ paddingRight: '32px' }}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals */}
            {!results ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calculator size={40} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <p style={{ fontSize: '0.9375rem' }}>Add line items with quantities and prices to see the total</p>
              </div>
            ) : (
              <div className="card" style={{ padding: '20px' }}>
                <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: '16px' }}>Summary</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { label: 'Subtotal', value: results.subtotal, muted: true },
                    ...(results.markupAmt > 0 ? [{ label: `Markup (${markup}%)`, value: results.markupAmt, muted: true }] : []),
                    ...(results.contingencyAmt > 0 ? [{ label: `Contingency (${contingency}%)`, value: results.contingencyAmt, muted: true }] : []),
                    ...(results.vatAmt > 0 ? [{ label: `VAT (${vatRate}%)`, value: results.vatAmt, muted: true }] : []),
                  ].map(({ label, value, muted }) => (
                    <div key={label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: '0.875rem', color: muted ? 'var(--text-muted)' : 'var(--text)', fontWeight: 500 }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>
                        {sym}{formatNumber(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--navy) 0%, #2D5BE3 100%)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '20px',
                  marginTop: '16px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '6px',
                  }}>
                    Grand Total (inc. VAT)
                  </div>
                  <div style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: 'Syne, sans-serif',
                    lineHeight: 1.1,
                  }}>
                    {sym}{formatNumber(results.grandTotal)}
                  </div>
                  {validItems.length > 0 && (
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: '6px',
                    }}>
                      {validItems.length} line {validItems.length === 1 ? 'item' : 'items'}
                    </div>
                  )}
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
        @media (max-width: 900px) {
          .cost-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .cost-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }
          .cost-row > *:nth-child(3),
          .cost-row > *:nth-child(4),
          .cost-row > *:nth-child(5) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
