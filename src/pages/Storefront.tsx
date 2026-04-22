import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { BRAZIL_STATES, CARGOS } from '../types';
import BrazilMap from '../components/storefront/BrazilMap';
import CandidateCard from '../components/storefront/CandidateCard';
import { Search, X } from 'lucide-react';

export default function Storefront() {
  const config = useStore((state) => state.config);
  const selectedState = useStore((state) => state.selectedState);
  const selectedMunicipality = useStore((state) => state.selectedMunicipality);
  const searchQuery = useStore((state) => state.searchQuery);

  const setSelectedState = useStore((state) => state.setSelectedState);
  const setSelectedMunicipality = useStore((state) => state.setSelectedMunicipality);
  const setSearchQuery = useStore((state) => state.setSearchQuery);

  const getCandidatesForState = useStore((state) => state.getCandidatesForState);
  const getStatesWithCandidates = useStore((state) => state.getStatesWithCandidates);
  const getCandidateCount = useStore((state) => state.getCandidateCount);
  const getMunicipalitiesForState = useStore((state) => state.getMunicipalitiesForState);

  const stateSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Apply theme colors
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);

    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config]);

  // Scroll to state section when state is selected
  useEffect(() => {
    if (selectedState && stateSectionRef.current) {
      stateSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedState]);

  const handleStateClick = (uf: string) => {
    setSelectedState(uf);
    setSelectedMunicipality(null);
  };

  const handleClearSelection = () => {
    setSelectedState(null);
    setSelectedMunicipality(null);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStateName = (uf: string) => {
    return BRAZIL_STATES.find(s => s.uf === uf)?.name || uf;
  };

  // Get available cargos for selected state in the correct order
  const cargoOrder = ['presidente', 'governador', 'senador', 'deputado-federal', 'deputado-estadual', 'prefeito'];

  // Get candidates to display - show all cargos
  const displayCandidatesByCargo = selectedState
    ? cargoOrder.map(cargoId => {
      const cargo = CARGOS.find(c => c.id === cargoId);
      if (!cargo) return null;

      const candidates = getCandidatesForState(selectedState, cargo.id).filter(c => {
        if (cargoId === 'prefeito' && selectedMunicipality) {
          return c.municipality === selectedMunicipality;
        }
        return true;
      });

      return candidates.length > 0 ? { cargo, candidates } : null;
    }).filter(Boolean)
    : [];

  // Get municipalities for prefeito cargo
  const municipalities = selectedState
    ? getMunicipalitiesForState(selectedState)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {config.headerImage && (
            <div className="mb-4">
              <img
                src={config.headerImage}
                alt="Header"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {config.logo && (
                <img src={config.logo} alt="Logo" className="h-12 w-auto" />
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {config.projectName}
              </h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar candidato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            <a
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <section ref={mapSectionRef} id="map-section" className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {config.mapTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {!selectedState
                ? '↓ Clique em um estado para ver os candidatos'
                : `← Você está vendo: ${getStateName(selectedState)}`}
            </p>
            {selectedState && (
              <button
                onClick={handleClearSelection}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Limpar seleção
              </button>
            )}
          </div>

          <BrazilMap
            selectedState={selectedState}
            statesWithCandidates={getStatesWithCandidates()}
            candidateCount={getCandidateCount}
            onStateClick={handleStateClick}
            primaryColor={config.primaryColor}
            mapColorEmpty={config.mapColorEmpty}
            mapColorFilled={config.mapColorFilled}
            mapColorHover={config.mapColorHover}
          />
        </div>
      </section>

      {/* State Section */}
      {selectedState && (
        <section
          ref={stateSectionRef}
          id="state-section"
          className="py-12 px-4 bg-white dark:bg-gray-800 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto">
            {/* State Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {getStateName(selectedState)} (UF: {selectedState.toUpperCase()})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getCandidateCount(selectedState)} candidato(s) cadastrado(s) neste estado
              </p>
              <button
                onClick={() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                ↑ Voltar ao mapa
              </button>
            </div>

            {/* Municipality Filter for Prefeito */}
            {municipalities.length > 0 && (
              <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtrar por município (Prefeito)
                </label>
                <select
                  value={selectedMunicipality || ''}
                  onChange={(e) => setSelectedMunicipality(e.target.value || null)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os municípios</option>
                  {municipalities.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Candidatos por Cargo - Seções Verticais */}
            {displayCandidatesByCargo.length > 0 ? (
              <div className="space-y-12">
                {displayCandidatesByCargo.map((item: any) => (
                  <section key={item.cargo.id} className="scroll-mt-20">
                    {/* Título do Cargo */}
                    <div className="mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">{item.cargo.icon}</span>
                        {item.cargo.name}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({item.candidates.length} candidato{item.candidates.length !== 1 ? 's' : ''})
                        </span>
                      </h3>
                    </div>

                    {/* Grid de Candidatos - Responsivo e Centralizado */}
                    <div className="flex justify-center">
                      <div className={`grid gap-6 ${item.candidates.length === 1
                        ? 'grid-cols-1 w-full max-w-md'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}>
                        {item.candidates.map((candidate: any) => (
                          <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            primaryColor={config.primaryColor}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhum candidato cadastrado para {getStateName(selectedState)} ainda.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">{config.footerText}</p>
          {config.footerContact && (
            <p className="text-sm text-gray-400">{config.footerContact}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
