import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Boxes,
  Paintbrush,
  Grid3x3,
  Home as HomeIcon,
  Ruler,
  Calculator,
  FolderOpen,
} from 'lucide-react';
import { useUnits } from '../hooks/useUnits.js';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { path: '/concrete', label: 'Concrete', icon: Layers },
  { path: '/blockbrick', label: 'Block & Brick', icon: Boxes },
  { path: '/paint', label: 'Paint', icon: Paintbrush },
  { path: '/tiles', label: 'Floor & Tile', icon: Grid3x3 },
  { path: '/roofing', label: 'Roofing', icon: HomeIcon },
  { path: '/steel', label: 'Steel Rebar', icon: Ruler },
  { path: '/cost', label: 'Cost Estimator', icon: Calculator },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
];

const MOBILE_TABS = [
  { path: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { path: '/concrete', label: 'Tools', icon: Layers },
  { path: '/cost', label: 'Cost', icon: Calculator },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { unit, setUnit } = useUnits();

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '240px',
        background: 'var(--navy)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        overflowY: 'auto',
      }} className="desktop-sidebar">
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={20} color="#fff" />
            </div>
            <div>
              <div className="font-syne" style={{
                fontWeight: 800,
                fontSize: '1.125rem',
                color: '#fff',
                lineHeight: 1.1,
              }}>
                QuantPro
              </div>
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--orange)',
                textTransform: 'uppercase',
              }}>
                Estimator
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <NavLink
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'rgba(249,115,22,0.18)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--orange)' : '3px solid transparent',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Unit Toggle at bottom */}
        <div style={{
          padding: '16px 16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
          }}>
            Unit System
          </div>
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '999px',
            padding: '3px',
            gap: '2px',
          }}>
            {['metric', 'imperial'].map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: unit === u ? '#fff' : 'transparent',
                  color: unit === u ? 'var(--navy)' : 'rgba(255,255,255,0.65)',
                }}
              >
                {u === 'metric' ? 'Metric' : 'Imperial'}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: '240px',
        minHeight: '100vh',
        background: 'var(--bg)',
        paddingBottom: '0px',
      }} className="main-content">
        {children}
      </main>

      {/* Mobile bottom tabs */}
      <nav className="mobile-tabs" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 200,
        padding: '0 4px',
      }}>
        {MOBILE_TABS.map(({ path, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === path
            : location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '8px 16px',
                color: isActive ? 'var(--navy)' : 'var(--text-muted)',
                textDecoration: 'none',
                minWidth: '60px',
              }}
            >
              <Icon size={22} />
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1,
              }}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .main-content {
            margin-left: 0 !important;
            padding-bottom: 72px !important;
          }
          .mobile-tabs { display: flex !important; }
        }
      `}</style>
    </>
  );
}
