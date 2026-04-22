import { Download, Upload, Database, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export default function BackupSection() {
    const { config, candidates, updateConfig, addCandidate } = useStore();
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleDownloadJSON = () => {
        const data = {
            config,
            candidates,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-mapa-politico-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setMessage({ type: 'success', text: 'Backup JSON baixado com sucesso!' });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleUploadJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validar estrutura básica
            if (!data.config || !data.candidates) {
                throw new Error('Arquivo JSON inválido. Estrutura incorreta. Deve conter "config" e "candidates".');
            }

            // Validar campos obrigatórios do config
            const requiredConfigFields = ['projectName', 'logo', 'headerImage', 'mapTitle', 'primaryColor', 'secondaryColor', 'mapColorEmpty', 'mapColorFilled', 'mapColorHover', 'aboutText', 'footerText', 'footerContact', 'theme'];
            const missingFields = requiredConfigFields.filter(field => !(field in data.config));

            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios faltando no config: ${missingFields.join(', ')}`);
            }

            // Validar estrutura dos candidatos
            if (!Array.isArray(data.candidates)) {
                throw new Error('O campo "candidates" deve ser um array.');
            }

            // Validar cada candidato
            data.candidates.forEach((candidate: any, index: number) => {
                const requiredCandidateFields = ['id', 'name', 'photo', 'partyName', 'partyAbbr', 'campaignNumber', 'cargo', 'state', 'description', 'socialLinks', 'createdAt', 'active'];
                const missingCandidateFields = requiredCandidateFields.filter(field => !(field in candidate));

                if (missingCandidateFields.length > 0) {
                    throw new Error(`Candidato ${index + 1}: campos obrigatórios faltando: ${missingCandidateFields.join(', ')}`);
                }

                // Validar cargo
                const validCargos = ['presidente', 'senador', 'deputado-federal', 'deputado-estadual', 'governador', 'prefeito'];
                if (!validCargos.includes(candidate.cargo)) {
                    throw new Error(`Candidato ${index + 1}: cargo inválido "${candidate.cargo}". Deve ser um de: ${validCargos.join(', ')}`);
                }
            });

            // Restaurar config
            updateConfig(data.config);

            // Restaurar candidatos
            data.candidates.forEach((candidate: any) => {
                addCandidate(candidate);
            });

            setMessage({
                type: 'success',
                text: `Backup restaurado com sucesso! ${data.candidates.length} candidato(s) importado(s).`
            });

        } catch (error) {
            console.error('Error uploading JSON:', error);
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erro ao restaurar backup. Verifique o arquivo.'
            });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Database size={24} />
                        Backup e Restauração
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Faça backup completo dos seus dados
                    </p>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Download size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Fazer Backup
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Baixe todos os seus dados
                        </p>
                        <button
                            onClick={handleDownloadJSON}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Baixar Backup JSON
                        </button>
                    </div>
                </div>

                {/* Restaurar */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <Upload size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Restaurar Backup
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Carregue um arquivo de backup JSON
                        </p>
                        <label className="block">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleUploadJSON}
                                disabled={uploading}
                                className="hidden"
                            />
                            <span className={`block w-full px-4 py-3 rounded-lg transition-colors font-medium cursor-pointer ${uploading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}>
                                {uploading ? 'Restaurando...' : 'Selecionar Arquivo JSON'}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Informações */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">
                            Estrutura do Backup
                        </h4>
                        <p className="text-sm text-blue-800 mb-2">
                            O arquivo JSON contém:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>config</strong> - Configurações do projeto (nome, cores, textos)</li>
                            <li>• <strong>candidates</strong> - Lista de candidatos com fotos e informações</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
