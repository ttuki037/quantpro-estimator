import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Boxes,
  Paintbrush,
  Grid3x3,
  Home as HomeIcon,
  Ruler,
  Calculator,
  FolderOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects.js';
import { formatRelativeDate } from '../utils/formatters.js';
import Navbar from '../components/Navbar.jsx';

const CALCULATORS = [
  {
    path: '/concrete',
    icon: Layers,
    title: 'Concrete Mix',
    description: 'Bags, sand, aggregate & water for any slab or pour',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    path: '/blockbrick',
    icon: Boxes,
    title: 'Block & Brick',
    description: 'Wall area, unit count, and mortar quantities',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    path: '/paint',
    icon: Paintbrush,
    title: 'Paint & Primer',
    description: 'Litres, coats, and primer for any room',
    color: '#EC4899',
    bg: '#FDF2F8',
  },
  {
    path: '/tiles',
    icon: Grid3x3,
    title: 'Floor & Tile',
    description: 'Tile count, adhesive, and grout for any pattern',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    path: '/roofing',
    icon: HomeIcon,
    title: 'Roofing',
    description: 'Tiles, sheets, ridge, and underlay for any roof type',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    path: '/steel',
    icon: Ruler,
    title: 'Steel Rebar',
    description: 'Bar count, length, and weight for reinforcement',
    color: '#6B7280',
    bg: '#F9FAFB',
  },
  {
    path: '/cost',
    icon: Calculator,
    title: 'Cost Estimator',
    description: 'Build itemised budgets with markup and VAT',
    color: '#16A34A',
    bg: '#F0FDF4',
  },
];

const TYPE_LABELS = {
  concrete: 'Concrete',
  blockbrick: 'Block & Brick',
  paint: 'Paint',
  tile: 'Floor & Tile',
  roofing: 'Roofing',
  steel: 'Steel Rebar',
  cost: 'Cost Estimate',
};

const TYPE_ICONS = {
  concrete: Layers,
  blockbrick: Boxes,
  paint: Paintbrush,
  tile: Grid3x3,
  roofing: HomeIcon,
  steel: Ruler,
  cost: Calculator,
};

function ProjectPreviewValues({ project }) {
  const r = project.results;
  if (!r) return null;

  const pairs = [];
  if (r.volumeM3 !== undefined) pairs.push(['Volume', `${r.volumeM3} m³`]);
  if (r.cementBags50kg !== undefined) pairs.push(['Cement Bags', r.cementBags50kg]);
  if (r.wallArea !== undefined) pairs.push(['Wall Area', `${r.wallArea} m²`]);
  if (r.blockCount !== undefined) pairs.push(['Blocks', r.blockCount]);
  if (r.paintLitres !== undefined) pairs.push(['Paint', `${r.paintLitres} L`]);
  if (r.tileCount !== undefined) pairs.push(['Tiles', r.tileCount]);
  if (r.roofArea !== undefined) pairs.push(['Roof Area', `${r.roofArea} m²`]);
  if (r.weightKg !== undefined) pairs.push(['Weight', `${r.weightKg} kg`]);
  if (r.grandTotal !== undefined) pairs.push(['Total', `£${r.grandTotal.toFixed(2)}`]);

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {pairs.slice(0, 2).map(([label, val]) => (
        <div key={label}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy)' }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { projects } = useProjects();
  const recentProjects = projects.slice(0, 3);

  return (
    <div>
      <Navbar title="Dashboard" />

      <div style={{ padding: '28px 28px 40px' }}>
        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #2D5BE3 100%)',
          borderRadius: 'var(--radius)',
          padding: '40px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '120px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(249,115,22,0.15)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="badge" style={{ background: 'rgba(249,115,22,0.25)', color: 'var(--orange)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <TrendingUp size={11} />
                Professional QS Tool
              </span>
            </div>

            <h1 className="font-syne" style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '12px',
              maxWidth: '520px',
            }}>
              Professional QS Estimating
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '1.0625rem',
              marginBottom: '28px',
              maxWidth: '480px',
              lineHeight: 1.6,
            }}>
              Calculate materials, estimate costs, and save project reports — all in one tool.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/concrete" className="btn-primary">
                Start Calculating
                <ArrowRight size={16} />
              </Link>
              <Link to="/projects" className="btn-ghost-white">
                View Projects
              </Link>
              {projects.length > 0 && (
                <div style={{
                  marginLeft: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.875rem',
                }}>
                  {projects.length} saved {projects.length === 1 ? 'project' : 'projects'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calculators grid */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <h2 className="section-title">Calculators</h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {CALCULATORS.length} tools available
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {CALCULATORS.map(({ path, icon: Icon, title, description, color, bg }) => (
              <Link
                key={path}
                to={path}
                className="card"
                style={{
                  display: 'block',
                  padding: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: 'var(--text)',
                      marginBottom: '4px',
                      fontFamily: 'Syne, sans-serif',
                    }}>
                      {title}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                    }}>
                      {description}
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <h2 className="section-title">Recent Projects</h2>
            {projects.length > 0 && (
              <Link to="/projects" style={{
                fontSize: '0.8125rem',
                color: 'var(--navy)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recentProjects.length === 0 ? (
            <div className="card" style={{
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--navy-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FolderOpen size={28} color="var(--navy)" />
              </div>
              <h3 className="font-syne" style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                marginBottom: '8px',
                color: 'var(--text)',
              }}>
                No saved projects yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '20px' }}>
                Run a calculation and save it to build your project history.
              </p>
              <Link to="/concrete" className="btn-primary btn-sm">
                Start your first calculation
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {recentProjects.map(project => {
                const Icon = TYPE_ICONS[project.type] || Calculator;
                return (
                  <div key={project.id} className="card" style={{ padding: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'var(--navy-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon size={18} color="var(--navy)" />
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: 'var(--text)',
                            lineHeight: 1.2,
                          }}>
                            {project.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatRelativeDate(project.date)}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-navy">
                        {TYPE_LABELS[project.type] || project.type}
                      </span>
                    </div>
                    <ProjectPreviewValues project={project} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
