import { create } from 'zustand';
import { AppConfig, Candidate, Cargo } from '../types';
import { storage } from '../utils/storage';

interface Store {
  config: AppConfig;
  candidates: Candidate[];

  // UI State
  selectedState: string | null;
  selectedCargo: Cargo | null;
  selectedMunicipality: string | null;
  searchQuery: string;
  showSaveNotification: boolean;

  // Config actions
  updateConfig: (config: Partial<AppConfig>) => void;

  // Candidate actions
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, candidate: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;

  // UI actions
  setSelectedState: (uf: string | null) => void;
  setSelectedCargo: (cargo: Cargo | null) => void;
  setSelectedMunicipality: (municipality: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Computed getters
  getCandidatesForState: (uf: string, cargo: Cargo) => Candidate[];
  getStatesWithCandidates: () => string[];
  getCandidateCount: (uf: string) => number;
  getMunicipalitiesForState: (uf: string) => string[];

  loadData: () => void;
  triggerSaveNotification: () => void;
}

const defaultConfig: AppConfig = {
  projectName: 'Voto Consciente',
  logo: '',
  headerImage: '',
  mapTitle: 'Mapa do Brasil',
  primaryColor: '#1D4ED8',
  secondaryColor: '#3B82F6',
  mapColorEmpty: '#D1D5DB',
  mapColorFilled: '#BFDBFE',
  mapColorHover: '#1D4ED8',
  aboutText: 'Conheça os candidatos e vote com consciência.',
  footerText: '© 2026 Voto Consciente.',
  footerContact: '',
  theme: 'light',
};

export const useStore = create<Store>((set, get) => ({
  config: defaultConfig,
  candidates: [],
  selectedState: null,
  selectedCargo: null,
  selectedMunicipality: null,
  searchQuery: '',
  showSaveNotification: false,

  updateConfig: (configUpdate) => {
    const updated = { ...get().config, ...configUpdate };
    set({ config: updated });

    const { candidates } = get();
    storage.saveAllData({ config: updated, candidates });
    get().triggerSaveNotification();
  },

  addCandidate: (candidate) => {
    const updated = [...get().candidates, candidate];
    set({ candidates: updated });

    const { config } = get();
    storage.saveAllData({ config, candidates: updated });
    get().triggerSaveNotification();
  },

  updateCandidate: (id, candidateUpdate) => {
    const updated = get().candidates.map((c) =>
      c.id === id ? { ...c, ...candidateUpdate } : c
    );
    set({ candidates: updated });

    const { config } = get();
    storage.saveAllData({ config, candidates: updated });
    get().triggerSaveNotification();
  },

  deleteCandidate: (id) => {
    const updated = get().candidates.filter((c) => c.id !== id);
    set({ candidates: updated });

    const { config } = get();
    storage.saveAllData({ config, candidates: updated });
    get().triggerSaveNotification();
  },

  setSelectedState: (uf) => set({ selectedState: uf }),
  setSelectedCargo: (cargo) => set({ selectedCargo: cargo }),
  setSelectedMunicipality: (municipality) => set({ selectedMunicipality: municipality }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getCandidatesForState: (uf, cargo) => {
    const { candidates } = get();
    return candidates.filter(
      (c) =>
        c.active &&
        (c.state === uf || c.state === 'NACIONAL') &&
        c.cargo === cargo
    );
  },

  getStatesWithCandidates: () => {
    const { candidates } = get();
    const states = new Set<string>();
    candidates.forEach((c) => {
      if (c.active && c.state !== 'NACIONAL') {
        states.add(c.state);
      }
    });
    return Array.from(states);
  },

  getCandidateCount: (uf) => {
    const { candidates } = get();
    return candidates.filter(
      (c) => c.active && (c.state === uf || c.state === 'NACIONAL')
    ).length;
  },

  getMunicipalitiesForState: (uf) => {
    const { candidates } = get();
    const municipalities = new Set<string>();
    candidates.forEach((c) => {
      if (c.active && c.state === uf && c.cargo === 'prefeito' && c.municipality) {
        municipalities.add(c.municipality);
      }
    });
    return Array.from(municipalities).sort();
  },

  loadData: async () => {
    const data = await storage.loadAllData();

    // Check if we need to seed data
    const hasData = data.config || data.candidates?.length > 0;

    if (!hasData) {
      // Load seed data
      const { seedConfig, seedCandidates } = await import('../utils/seedData');
      set({
        config: seedConfig,
        candidates: seedCandidates,
      });
      // Save seed data
      storage.saveAllData({ config: seedConfig, candidates: seedCandidates });
    } else {
      set({
        config: data.config || defaultConfig,
        candidates: data.candidates || [],
      });
    }
  },

  triggerSaveNotification: () => {
    set({ showSaveNotification: true });
    setTimeout(() => {
      set({ showSaveNotification: false });
    }, 100);
  },
}));
