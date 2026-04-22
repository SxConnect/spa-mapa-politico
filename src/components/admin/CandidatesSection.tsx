import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { BRAZIL_STATES, CARGOS, Candidate, Cargo } from '../../types';
import { Plus, Search, Edit, Trash2, Clock, Check, X } from 'lucide-react';
import CandidateForm from './CandidateForm';

export default function CandidatesSection() {
    const candidates = useStore((state) => state.candidates);
    const deleteCandidate = useStore((state) => state.deleteCandidate);
    const updateCandidate = useStore((state) => state.updateCandidate);

    const [showForm, setShowForm] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [filterState, setFilterState] = useState<string>('');
    const [filterCargo, setFilterCargo] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'pending'>('pending');

    const handleEdit = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este candidato?')) {
            deleteCandidate(id);
        }
    };

    const handleApprove = (candidate: Candidate) => {
        updateCandidate(candidate.id, { ...candidate, active: true });
    };

    const handleReject = (id: string) => {
        if (confirm('Tem certeza que deseja rejeitar este candidato? Ele será excluído permanentemente.')) {
            deleteCandidate(id);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCandidate(null);
    };

    // Separate candidates by status
    const activeCandidates = candidates.filter(c => c.active);
    const pendingCandidates = candidates.filter(c => !c.active);

    // Filter candidates based on active tab
    const candidatesToShow = activeTab === 'active' ? activeCandidates : pendingCandidates;

    const filteredCandidates = candidatesToShow.filter((c) => {
        if (filterState && c.state !== filterState && c.state !== 'NACIONAL') return false;
        if (filterCargo && c.cargo !== filterCargo) return false;
        if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const getCargoName = (cargo: Cargo) => {
        return CARGOS.find((c) => c.id === cargo)?.name || cargo;
    };

    const getStateName = (uf: string) => {
        if (uf === 'NACIONAL') return 'Nacional';
        return BRAZIL_STATES.find((s) => s.uf === uf)?.name || uf;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gerenciar Candidatos
                </h2>
                <div className="flex items-center gap-4">
                    <a
                        href="/form"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                        Ver Formulário Público
                    </a>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Adicionar Candidato
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'pending'
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <Clock size={18} />
                    Pendentes ({pendingCandidates.length})
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'active'
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <Check size={18} />
                    Ativos ({activeCandidates.length})
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                    </label>
                    <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Todos os estados</option>
                        {BRAZIL_STATES.map((state) => (
                            <option key={state.uf} value={state.uf}>
                                {state.name} ({state.uf})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cargo
                    </label>
                    <select
                        value={filterCargo}
                        onChange={(e) => setFilterCargo(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Todos os cargos</option>
                        {CARGOS.map((cargo) => (
                            <option key={cargo.id} value={cargo.id}>
                                {cargo.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Buscar
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Nome do candidato..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {filteredCandidates.length} candidato(s) encontrado(s)
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Foto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Nome
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Cargo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Município
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Número
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Data
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3">
                                    {candidate.photo ? (
                                        <img
                                            src={candidate.photo}
                                            alt={candidate.name}
                                            className="w-10 h-14 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-14 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                                            {candidate.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    <div>
                                        <div className="font-medium">{candidate.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {candidate.fullName && candidate.fullName !== candidate.name && (
                                                <div>Nome completo: {candidate.fullName}</div>
                                            )}
                                            {candidate.partyAbbr} - {candidate.campaignNumber}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {getCargoName(candidate.cargo)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {getStateName(candidate.state)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {candidate.municipality || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                                    {candidate.campaignNumber}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        {activeTab === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(candidate)}
                                                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                                                    title="Aprovar"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(candidate.id)}
                                                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                                                    title="Rejeitar"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(candidate)}
                                                className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(candidate.id)}
                                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        {activeTab === 'pending'
                            ? 'Nenhum candidato pendente de aprovação'
                            : 'Nenhum candidato ativo encontrado'
                        }
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <CandidateForm
                    candidate={editingCandidate}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
