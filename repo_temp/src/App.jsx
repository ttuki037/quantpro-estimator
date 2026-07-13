import React, { createContext, useContext, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import ConcreteCalc from './pages/ConcreteCalc.jsx';
import BlockBrickCalc from './pages/BlockBrickCalc.jsx';
import PaintCalc from './pages/PaintCalc.jsx';
import TileCalc from './pages/TileCalc.jsx';
import RoofingCalc from './pages/RoofingCalc.jsx';
import SteelCalc from './pages/SteelCalc.jsx';
import CostEstimator from './pages/CostEstimator.jsx';
import Projects from './pages/Projects.jsx';

export const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export default function App() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/concrete" element={<ConcreteCalc />} />
            <Route path="/blockbrick" element={<BlockBrickCalc />} />
            <Route path="/paint" element={<PaintCalc />} />
            <Route path="/tiles" element={<TileCalc />} />
            <Route path="/roofing" element={<RoofingCalc />} />
            <Route path="/steel" element={<SteelCalc />} />
            <Route path="/cost" element={<CostEstimator />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </Layout>
        <Toast />
        <>
          <style>{`
            #createos-badge {
              position: fixed; bottom: 12px; right: 12px; z-index: 9999;
              display: flex; align-items: center; gap: 6px;
              padding: 6px 10px;
              background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
              border: 1px solid rgba(0,0,0,0.08); border-radius: 999px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.10);
              font-size: 11px; font-weight: 500; color: #374151;
              text-decoration: none; font-family: system-ui, sans-serif;
            }
            #createos-badge:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
            #createos-badge img { width: 14px; height: 14px; }
          `}</style>
          <a id="createos-badge" href="https://createos.sh/app" target="_blank" rel="noopener noreferrer">
            <img src="https://nodeops.network/SymbolBlack.svg" alt="" />
            Built with CreateOS
          </a>
        </>
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
