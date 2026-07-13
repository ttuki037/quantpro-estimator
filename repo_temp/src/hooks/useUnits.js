import { useState, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

export function useUnits() {
  const [unit, setUnitState] = useState(() => loadFromStorage('qs_unit', 'metric'));

  const setUnit = useCallback((u) => {
    setUnitState(u);
    saveToStorage('qs_unit', u);
  }, []);

  const convert = useCallback((value, from, to, type = 'length') => {
    if (from === to) return value;
    const v = parseFloat(value);
    if (isNaN(v)) return value;

    if (type === 'length') {
      if (from === 'metric' && to === 'imperial') return parseFloat((v / 0.3048).toFixed(4));
      if (from === 'imperial' && to === 'metric') return parseFloat((v * 0.3048).toFixed(4));
    }
    if (type === 'area') {
      if (from === 'metric' && to === 'imperial') return parseFloat((v / 0.0929).toFixed(4));
      if (from === 'imperial' && to === 'metric') return parseFloat((v * 0.0929).toFixed(4));
    }
    if (type === 'volume') {
      if (from === 'metric' && to === 'imperial') return parseFloat((v / 0.0283168).toFixed(4));
      if (from === 'imperial' && to === 'metric') return parseFloat((v * 0.0283168).toFixed(4));
    }
    return value;
  }, []);

  const lengthLabel = unit === 'imperial' ? 'ft' : 'm';
  const areaLabel = unit === 'imperial' ? 'ft²' : 'm²';
  const volumeLabel = unit === 'imperial' ? 'ft³' : 'm³';

  return { unit, setUnit, convert, lengthLabel, areaLabel, volumeLabel };
}
