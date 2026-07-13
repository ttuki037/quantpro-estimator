import React, { useState, useMemo } from 'react';
import {
  Trash2, Download, Search, FolderOpen, Layers, Boxes,
  Paintbrush, Grid3x3, Home as HomeIcon, Ruler, Calculator, X,
  Filter, ChevronDown,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects.js';
import { useToast } from '../App.jsx';
import { formatDate, formatCurrency, formatNumber } from '../utils/formatters.js';
import { downloadTextReport } from '../utils/storage.js';
import Navbar from '../components/Navbar.jsx';

const TYPE_META = {
  concrete: { label: 'Concrete', icon: Layers, color: '#3B82F6', bg: '#EFF6FF' },
  blockbrick: { label: 'Block & Brick', icon: Boxes, color: '#8B5CF6', bg: '#F5F3FF' },
  paint: { label: 'Paint', icon: Paintbrush, color: '#EC4899', bg: '#FDF2F8' },
  tile: { label: 'Floor & Tile', icon: Grid3x3, color: '#F59E0B', bg: '#FFFBEB' },
  roofing: { label: 'Roofing', icon: HomeIcon, color: '#10B981', bg: '#ECFDF5' },
  steel: { label: 'Steel Rebar', icon: Ruler, color: '#6B7280', bg: '#F9FAFB' },
  cost: { label: 'Cost Estimate', icon: Calculator, color: '#16A34A', bg: '#F0FDF4' },
};

function getPreviewRows(project) {
  const r = project.results;
  if (!r) return [];
  const rows = [];
  if (r.volumeM3 !== undefined) rows.push(['Wet Volume', `${r.volumeM3} m³`]);
  if (r.dryVolumeM3 !== undefined) rows.push(['Dry Volume', `${r.dryVolumeM3} m³`]);
  if (r.cementBags50kg !== undefined) rows.push(['Cement Bags (50kg)', r.cementBags50kg]);
  if (r.cementKg !== undefined) rows.push(['Cement', `${r.cementKg} kg`]);
  if (r.sand_m3 !== undefined) rows.push(['Sand', `${r.sand_m3} m³`]);
  if (r.aggregate_m3 !== undefined) rows.push(['Aggregate', `${r.aggregate_m3} m³`]);
  if (r.water_L !== undefined) rows.push(['Water', `${r.water_L} L`]);
  if (r.wallArea !== undefined) rows.push(['Wall Area', `${r.wallArea} m²`]);
  if (r.blockCount !== undefined) rows.push(['Block Count', r.blockCount]);
  if (r.blocksPerM2 !== undefined) rows.push(['Blocks/m²', r.blocksPerM2]);
  if (r.cementBags !== undefined && r.blockCount !== undefined) rows.push(['Mortar Bags', r.cementBags]);
  if (r.paintLitres !== undefined) rows.push(['Paint', `${r.paintLitres} L`]);
  if (r.primerLitres !== undefined && r.primerLitres > 0) rows.push(['Primer', `${r.primerLitres} L`]);
  if (r.totalArea !== undefined) rows.push(['Total Area', `${r.totalArea} m²`]);
  if (r.floorArea !== undefined) rows.push(['Floor Area', `${r.floorArea} m²`]);
  if (r.tileCount !== undefined) rows.push(['Tiles', r.tileCount]);
  if (r.boxCount !== undefined) rows.push(['Boxes', r.boxCount]);
  if (r.roofArea !== undefined) rows.push(['Roof Area', `${r.roofArea} m²`]);
  if (r.unitCount !== undefined) rows.push([r.unitName ? r.unitName.charAt(0).toUpperCase() + r.unitName.slice(1) : 'Units', r.unitCount]);
  if (r.underlayM2 !== undefined) rows.push(['Underlay', `${r.underlayM2} m²`]);
  if (r.totalBars !== undefined) rows.push(['Total Bars', r.totalBars]);
  if (r.weightKg !== undefined) rows.push(['Weight', `${r.weightKg} kg`]);
  if (r.tonnage !== undefined) rows.push(['Tonnage', `${r.tonnage} t`]);
  if (r.grandTotal !== undefined) rows.push(['Grand Total', `£${formatNumber(r.grandTotal)}`]);
  if (r.subtotal !== undefined) rows.push(['Subtotal', `£${formatNumber(r.subtotal)}`]);
  return rows;
}

function ProjectCard({ project, onDelete, onDownload }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[project.type] || TYPE_META.cost;
  const Icon = meta.icon;
  const previewRows = getPreviewRows(project);

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        cursor: 'pointer',
        userSelect: 'none',
      }} onClick={() => setExpanded(e => !e)}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: meta.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} color={meta.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}>
            <div style={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {project.name}
            </div>
            <span className="badge" style={{
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.color}30`,
              flexShrink: 0,
            }}>
              {meta.label}
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatDate(project.date)}
            {project.unit && (
              <span style={{ marginLeft: '10px', color: 'var(--text-light)' }}>
                · {project.unit === 'imperial' ? 'Imperial' : 'Metric'}
              </span>
            )}
          </div>

          {/* Quick stats (top 3) */}
          {previewRows.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
              {previewRows.slice(0, 3).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy)' }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <ChevronDown
          size={18}
          color="var(--text-muted)"
          style={{
            flexShrink: 0,
            marginTop: '2px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Inputs */}
          {project.inputs && Object.keys(project.inputs).length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}>
                Inputs
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px',
              }}>
                {Object.entries(project.inputs).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 500, letterSpacing: '0.04em' }}>
                      {k.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All results */}
          {previewRows.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}>
                Results
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '10px',
              }}>
                {previewRows.map(([label, val]) => (
                  <div key={label} style={{
                    background: 'var(--bg)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            padding: '12px 20px',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}>
            <button
              className="btn-ghost btn-sm"
              onClick={() => onDownload(project)}
              style={{ gap: '6px' }}
            >
              <Download size={14} />
              Download Report
            </button>
            <button
              className="btn-danger btn-sm"
              onClick={() => onDelete(project.id)}
              style={{ gap: '6px' }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const { projects, deleteProject } = useProjects();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = useMemo(() => {
    let list = projects;
    if (filterType !== 'all') list = list.filter(p => p.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (TYPE_META[p.type]?.label || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, filterType, search]);

  const handleDelete = (id) => setConfirmDeleteId(id);

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteProject(confirmDeleteId);
    setConfirmDeleteId(null);
    showToast('Project deleted', 'success');
  };

  const handleDownload = (project) => {
    downloadTextReport(project);
    showToast('Report downloaded', 'success');
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(TYPE_META).map(([v, m]) => ({ value: v, label: m.label })),
  ];

  return (
    <div>
      <Navbar title="Projects" />

      <div style={{ padding: '28px' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              className="ruler-input"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '14px' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Filter size={14} color="var(--text-muted)" style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
            }} />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="ruler-input"
              style={{ paddingLeft: '34px', paddingRight: '36px', minWidth: '140px', cursor: 'pointer' }}
            >
              {typeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </div>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="card" style={{ padding: '64px 40px', textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: 'var(--navy-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <FolderOpen size={32} color="var(--navy)" />
            </div>
            <h3 className="font-syne" style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text)' }}>
              No projects saved yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '380px', margin: '0 auto' }}>
              Run any calculator, enter your values, and click <strong>Save Project</strong> to build your project history here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={32} color="var(--border)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p>No projects match your search.</p>
            <button
              className="btn-ghost btn-sm"
              onClick={() => { setSearch(''); setFilterType('all'); }}
              style={{ marginTop: '12px' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setConfirmDeleteId(null)}>
          <div
            className="card"
            style={{ padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h3 className="font-syne" style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '8px', color: 'var(--text)' }}>
              Delete Project?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '24px' }}>
              This action cannot be undone. The project will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
