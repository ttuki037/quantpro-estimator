import { useState, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

const STORAGE_KEY = 'qs_projects';

export function useProjects() {
  const [projects, setProjects] = useState(() => loadFromStorage(STORAGE_KEY, []));

  const persist = useCallback((updated) => {
    setProjects(updated);
    saveToStorage(STORAGE_KEY, updated);
  }, []);

  const saveProject = useCallback((project) => {
    const existing = loadFromStorage(STORAGE_KEY, []);
    const newProject = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...project,
    };
    const updated = [newProject, ...existing];
    persist(updated);
    return newProject;
  }, [persist]);

  const updateProject = useCallback((id, updates) => {
    const existing = loadFromStorage(STORAGE_KEY, []);
    const updated = existing.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    persist(updated);
  }, [persist]);

  const deleteProject = useCallback((id) => {
    const existing = loadFromStorage(STORAGE_KEY, []);
    const updated = existing.filter(p => p.id !== id);
    persist(updated);
  }, [persist]);

  const getProject = useCallback((id) => {
    const existing = loadFromStorage(STORAGE_KEY, []);
    return existing.find(p => p.id === id) || null;
  }, []);

  return { projects, saveProject, deleteProject, updateProject, getProject };
}
