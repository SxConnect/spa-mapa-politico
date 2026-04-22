import { AppConfig, Candidate } from '../types';
import { api } from './api';

// Fallback to localStorage if API is not available
const USE_API = true;

const KEYS = {
  CONFIG: 'app-config',
  CANDIDATES: 'candidates',
};

export const storage = {
  // Load all data from JSON file via API
  loadAllData: async () => {
    if (USE_API) {
      try {
        const data = await api.loadData();
        if (data) return data;
      } catch (error) {
        console.error('API not available, using localStorage');
      }
    }

    // Fallback to localStorage
    return {
      config: storage.getConfig(),
      candidates: storage.getCandidates(),
    };
  },

  // Save all data to JSON file via API
  saveAllData: async (data: { config: AppConfig; candidates: Candidate[] }) => {
    if (USE_API) {
      try {
        await api.saveData(data);
        // Also save to localStorage as backup
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(data.config));
        localStorage.setItem(KEYS.CANDIDATES, JSON.stringify(data.candidates));
        return true;
      } catch (error) {
        console.error('Failed to save to API, using localStorage only');
      }
    }

    // Fallback to localStorage
    storage.setConfig(data.config);
    storage.setCandidates(data.candidates);
    return true;
  },

  getConfig: (): AppConfig | null => {
    const data = localStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  },

  setConfig: (config: AppConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getCandidates: (): Candidate[] => {
    const data = localStorage.getItem(KEYS.CANDIDATES);
    return data ? JSON.parse(data) : [];
  },

  setCandidates: (candidates: Candidate[]) => {
    localStorage.setItem(KEYS.CANDIDATES, JSON.stringify(candidates));
  },
};
