import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { BRAZIL_STATES, CARGOS, Candidate, Cargo, SocialLinks } from '../../types';
import { X, Upload, Save } from 'lucide-react';
import { validateWhatsAppNumber, generateWhatsAppUrl, extractNumberFromWhatsAppUrl, formatPhoneForDisplay } from '../../utils/whatsapp';

interface CandidateFormProps {
    candidate: Candidate | null;
    onClose: () => void;
}

export default function CandidateForm({ candidate, onClose }: CandidateFormProps) {
    const addCandidate = useStore((state) => state.addCandidate);
    const updateCandidate = useStore((state) => state.updateCandidate);

    const [formData, setFormData] = useState<Partial<Candidate>>({
        name: '', // Nome Político
        fullName: '', // Nome Completo
        photo: '',
        partyName: '',
        partyAbbr: '',
        campaignNumber: '',
        cargo: 'presidente',
        state: 'SP',
        municipality: '',
        description: '',
        socialLinks: {},
        websiteUrl: '',
        whatsappUrl: '',
        officialSiteUrl: '',
        active: true,
    });

    const [photoPreview, setPhotoPreview] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState(''); // Número do WhatsApp separado

    useEffect(() => {
        if (candidate) {
            setFormData(candidate);
            setPhotoPreview(candidate.photo);
            // Extrair número do WhatsApp da URL existente
            const extractedNumber = extractNumberFromWhatsAppUrl(candidate.whatsappUrl || '');
            setWhatsappNumber(extractedNumber);
        }
    }, [candidate]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Compress and convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                setPhotoPreview(base64);
                setFormData({ ...formData, photo: base64 });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        setWhatsappNumber(value);

        // Gera a URL automaticamente se o número for válido
        if (value && validateWhatsAppNumber(value)) {
            const whatsappUrl = generateWhatsAppUrl(value);
            setFormData({ ...formData, whatsappUrl });
        } else {
            setFormData({ ...formData, whatsappUrl: '' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || formData.name.length < 3) {
            alert('Nome político deve ter no mínimo 3 caracteres');
            return;
        }

        if (!formData.fullName || formData.fullName.length < 3) {
            alert('Nome completo deve ter no mínimo 3 caracteres');
            return;
        }

        if (!formData.campaignNumber || formData.campaignNumber.length < 2) {
            alert('Número de campanha deve ter no mínimo 2 dígitos');
            return;
        }

        if (formData.cargo === 'prefeito' && !formData.municipality) {
            alert('Município é obrigatório para candidatos a Prefeito');
            return;
        }

        const candidateData: Candidate = {
            id: candidate?.id || Date.now().toString(),
            name: formData.name!,
            fullName: formData.fullName!,
            photo: formData.photo || '',
            partyName: formData.partyName || '',
            partyAbbr: formData.partyAbbr || '',
            campaignNumber: formData.campaignNumber!,
            cargo: formData.cargo as Cargo,
            state: formData.cargo === 'presidente' ? 'NACIONAL' : formData.state!,
            municipality: formData.municipality,
            description: formData.description || '',
            socialLinks: formData.socialLinks || {},
            websiteUrl: formData.websiteUrl,
            whatsappUrl: formData.whatsappUrl,
            officialSiteUrl: formData.officialSiteUrl,
            createdAt: candidate?.createdAt || new Date().toISOString(),
            active: formData.active ?? true,
        };

        if (candidate) {
            updateCandidate(candidate.id, candidateData);
        } else {
            addCandidate(candidateData);
        }

        onClose();
    };

    const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
        setFormData({
            ...formData,
            socialLinks: {
                ...formData.socialLinks,
                [platform]: value || undefined,
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {candidate ? 'Editar Candidato' : 'Novo Candidato'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Photo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Foto (opcional)
                        </label>
                        <div className="flex items-center gap-4">
                            {photoPreview ? (
                                <div className="relative">
                                    <img src={photoPreview} alt="Preview" className="w-24 h-32 rounded-lg object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotoPreview('');
                                            setFormData({ ...formData, photo: '' });
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-400">Sem foto</span>
                                </div>
                            )}
                            <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Upload size={20} />
                                {photoPreview ? 'Trocar Foto' : 'Upload Foto'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            A imagem será redimensionada automaticamente (máx. 600px)
                        </p>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                            minLength={3}
                            placeholder="Nome completo do candidato"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Nome completo para identificação oficial
                        </p>
                    </div>

                    {/* Political Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome Político *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                            minLength={3}
                            placeholder="Nome que aparecerá no card"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Nome que será exibido no card do candidato
                        </p>
                    </div>

                    {/* Party */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome do Partido *
                            </label>
                            <input
                                type="text"
                                value={formData.partyName}
                                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ex: Partido dos Trabalhadores"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sigla do Partido *
                            </label>
                            <input
                                type="text"
                                value={formData.partyAbbr}
                                onChange={(e) => setFormData({ ...formData, partyAbbr: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ex: PT"
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>

                    {/* Campaign Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Número de Campanha *
                        </label>
                        <input
                            type="text"
                            value={formData.campaignNumber}
                            onChange={(e) => setFormData({ ...formData, campaignNumber: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                            placeholder="Ex: 13"
                            minLength={2}
                            maxLength={12}
                            required
                        />
                    </div>

                    {/* Cargo and State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cargo *
                            </label>
                            <select
                                value={formData.cargo}
                                onChange={(e) => setFormData({ ...formData, cargo: e.target.value as Cargo, municipality: '' })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            >
                                {CARGOS.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Estado *
                            </label>
                            <select
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                disabled={formData.cargo === 'presidente'}
                                required
                            >
                                {formData.cargo === 'presidente' ? (
                                    <option value="NACIONAL">Nacional</option>
                                ) : (
                                    BRAZIL_STATES.map((state) => (
                                        <option key={state.uf} value={state.uf}>
                                            {state.name} ({state.uf})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Municipality (only for Prefeito) */}
                    {formData.cargo === 'prefeito' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Município *
                            </label>
                            <input
                                type="text"
                                value={formData.municipality}
                                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ex: São Paulo"
                                required
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descrição / Biografia (opcional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Breve descrição do candidato..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description?.length || 0}/500 caracteres
                        </p>
                    </div>

                    {/* Social Links */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Redes Sociais (opcional)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="url"
                                value={formData.socialLinks?.instagram || ''}
                                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                placeholder="Instagram URL"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <input
                                type="url"
                                value={formData.socialLinks?.facebook || ''}
                                onChange={(e) => updateSocialLink('facebook', e.target.value)}
                                placeholder="Facebook URL"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <input
                                type="url"
                                value={formData.socialLinks?.twitter || ''}
                                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                placeholder="X/Twitter URL"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <input
                                type="url"
                                value={formData.socialLinks?.youtube || ''}
                                onChange={(e) => updateSocialLink('youtube', e.target.value)}
                                placeholder="YouTube URL"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <input
                                type="url"
                                value={formData.socialLinks?.tiktok || ''}
                                onChange={(e) => updateSocialLink('tiktok', e.target.value)}
                                placeholder="TikTok URL"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <input
                                type="url"
                                value={formData.socialLinks?.linkedin || ''}
                                onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                                placeholder="LinkedIn URL"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site / Página de Campanha (opcional)
                        </label>
                        <input
                            type="url"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Contact Links */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Links de Contato (opcional)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    WhatsApp do Candidato
                                </label>
                                <input
                                    type="tel"
                                    value={whatsappNumber}
                                    onChange={handleWhatsAppChange}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${whatsappNumber && !validateWhatsAppNumber(whatsappNumber)
                                            ? 'border-red-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="11999999999"
                                    maxLength={11}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {whatsappNumber ? (
                                        validateWhatsAppNumber(whatsappNumber) ? (
                                            <>✅ {formatPhoneForDisplay(whatsappNumber)} - Aparecerá como botão "Fale com o candidato"</>
                                        ) : (
                                            <>❌ Número inválido. Use formato: DDD + número (ex: 11999999999)</>
                                        )
                                    ) : (
                                        'Digite apenas números: DDD + número (ex: 11999999999)'
                                    )}
                                </p>
                                {formData.whatsappUrl && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        🔗 Link gerado: {formData.whatsappUrl}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Site Oficial do Candidato
                                </label>
                                <input
                                    type="url"
                                    value={formData.officialSiteUrl || ''}
                                    onChange={(e) => setFormData({ ...formData, officialSiteUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="https://candidato.com.br"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Aparecerá como botão "Site oficial do Candidato"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Candidato ativo (visível no site)
                            </span>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {candidate ? 'Atualizar' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
