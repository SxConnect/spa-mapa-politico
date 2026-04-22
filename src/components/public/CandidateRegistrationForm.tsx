import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { BRAZIL_STATES, CARGOS, Candidate, Cargo, SocialLinks } from '../../types';
import { Upload, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { validateWhatsAppNumber, generateWhatsAppUrl, formatPhoneForDisplay } from '../../utils/whatsapp';

export default function CandidateRegistrationForm() {
    const addCandidate = useStore((state) => state.addCandidate);
    const config = useStore((state) => state.config);

    const [formData, setFormData] = useState({
        name: '', // Nome Político
        fullName: '', // Nome Completo
        photo: '',
        partyName: '',
        partyAbbr: '',
        campaignNumber: '',
        cargo: 'deputado-federal' as Cargo,
        state: 'SP',
        municipality: '',
        description: '',
        socialLinks: {} as SocialLinks,
        whatsappUrl: '',
        officialSiteUrl: '',
    });

    const [photoPreview, setPhotoPreview] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState(''); // Número do WhatsApp separado
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const maxDescriptionLength = 500;

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho do arquivo (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, photo: 'A foto deve ter no máximo 5MB' });
            return;
        }

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
                setErrors({ ...errors, photo: '' });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Nome político deve ter no mínimo 3 caracteres';
        }

        if (!formData.fullName || formData.fullName.length < 3) {
            newErrors.fullName = 'Nome completo deve ter no mínimo 3 caracteres';
        }

        if (!formData.partyName || formData.partyName.length < 2) {
            newErrors.partyName = 'Nome do partido é obrigatório';
        }

        if (!formData.partyAbbr || formData.partyAbbr.length < 2) {
            newErrors.partyAbbr = 'Sigla do partido é obrigatória';
        }

        if (!formData.campaignNumber || formData.campaignNumber.length < 2) {
            newErrors.campaignNumber = 'Número de campanha deve ter no mínimo 2 dígitos';
        }

        if (formData.cargo === 'prefeito' && !formData.municipality) {
            newErrors.municipality = 'Município é obrigatório para candidatos a Prefeito';
        }

        if (formData.description && formData.description.length > maxDescriptionLength) {
            newErrors.description = `Descrição deve ter no máximo ${maxDescriptionLength} caracteres`;
        }

        // Validar URLs se preenchidas (exceto WhatsApp que é gerado automaticamente)
        const urlFields = ['officialSiteUrl'];
        urlFields.forEach(field => {
            const value = formData[field as keyof typeof formData] as string;
            if (value && !isValidUrl(value)) {
                newErrors[field] = 'URL inválida';
            }
        });

        // Validar redes sociais se preenchidas
        Object.entries(formData.socialLinks).forEach(([platform, url]) => {
            if (url && !isValidUrl(url)) {
                newErrors[`social_${platform}`] = 'URL inválida';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string: string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const candidateData: Candidate = {
                id: Date.now().toString(),
                name: formData.name,
                fullName: formData.fullName,
                photo: formData.photo,
                partyName: formData.partyName,
                partyAbbr: formData.partyAbbr.toUpperCase(),
                campaignNumber: formData.campaignNumber,
                cargo: formData.cargo,
                state: formData.cargo === 'presidente' ? 'NACIONAL' : formData.state,
                municipality: formData.municipality,
                description: formData.description,
                socialLinks: formData.socialLinks,
                websiteUrl: '', // Campo não usado no formulário público
                whatsappUrl: formData.whatsappUrl,
                officialSiteUrl: formData.officialSiteUrl,
                createdAt: new Date().toISOString(),
                active: false, // Inativo por padrão, aguardando aprovação
            };

            addCandidate(candidateData);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Erro ao cadastrar candidato:', error);
            setErrors({ submit: 'Erro ao enviar cadastro. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
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

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Cadastro Enviado com Sucesso!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Seu cadastro foi recebido e está aguardando aprovação do administrador.
                            Você será notificado quando seu perfil for aprovado e publicado no site.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Voltar ao Site
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div
                        className="px-8 py-6 text-white"
                        style={{ backgroundColor: config.primaryColor }}
                    >
                        <h1 className="text-3xl font-bold mb-2">Cadastro de Candidato</h1>
                        <p className="text-white/90">
                            Preencha os dados abaixo para cadastrar seu perfil.
                            Após o envio, seu cadastro será analisado e aprovado pelo administrador.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Dados Pessoais */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Dados Pessoais
                            </h3>

                            {/* Foto */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Foto do Candidato (opcional)
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
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">Sem foto</span>
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
                                {errors.photo && (
                                    <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                                </p>
                            </div>

                            {/* Nome Completo */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Digite seu nome completo"
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Nome completo para identificação oficial
                                </p>
                            </div>

                            {/* Nome Político */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nome Político *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Como você quer aparecer no site (ex: João da Silva)"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Nome que aparecerá no card do candidato
                                </p>
                            </div>
                        </div>

                        {/* Dados Políticos */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Dados Políticos
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Partido */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nome do Partido *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.partyName}
                                        onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.partyName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Ex: Partido dos Trabalhadores"
                                    />
                                    {errors.partyName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.partyName}</p>
                                    )}
                                </div>

                                {/* Sigla */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sigla do Partido *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.partyAbbr}
                                        onChange={(e) => setFormData({ ...formData, partyAbbr: e.target.value.toUpperCase() })}
                                        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.partyAbbr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Ex: PT"
                                        maxLength={6}
                                    />
                                    {errors.partyAbbr && (
                                        <p className="text-red-500 text-sm mt-1">{errors.partyAbbr}</p>
                                    )}
                                </div>
                            </div>

                            {/* Número de Campanha */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Número de Campanha *
                                </label>
                                <input
                                    type="text"
                                    value={formData.campaignNumber}
                                    onChange={(e) => setFormData({ ...formData, campaignNumber: e.target.value.replace(/\D/g, '') })}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono ${errors.campaignNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Ex: 13"
                                    maxLength={12}
                                />
                                {errors.campaignNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.campaignNumber}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Cargo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cargo *
                                    </label>
                                    <select
                                        value={formData.cargo}
                                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value as Cargo, municipality: '' })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {CARGOS.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Estado *
                                    </label>
                                    <select
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        disabled={formData.cargo === 'presidente'}
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

                            {/* Município (apenas para Prefeito) */}
                            {formData.cargo === 'prefeito' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Município *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.municipality}
                                        onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.municipality ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Ex: São Paulo"
                                    />
                                    {errors.municipality && (
                                        <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descrição / Biografia (opcional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                maxLength={maxDescriptionLength}
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                placeholder="Conte um pouco sobre você, sua trajetória e propostas..."
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.description && (
                                    <p className="text-red-500 text-sm">{errors.description}</p>
                                )}
                                <p className={`text-xs ml-auto ${formData.description.length > maxDescriptionLength * 0.9
                                    ? 'text-orange-500'
                                    : 'text-gray-500'
                                    }`}>
                                    {formData.description.length}/{maxDescriptionLength} caracteres
                                </p>
                            </div>
                        </div>

                        {/* Redes Sociais */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Redes Sociais e Contato (opcional)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="url"
                                    value={formData.socialLinks?.instagram || ''}
                                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                    placeholder="Instagram (https://instagram.com/...)"
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.social_instagram ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                                <input
                                    type="url"
                                    value={formData.socialLinks?.facebook || ''}
                                    onChange={(e) => updateSocialLink('facebook', e.target.value)}
                                    placeholder="Facebook (https://facebook.com/...)"
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.social_facebook ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                                <input
                                    type="url"
                                    value={formData.socialLinks?.twitter || ''}
                                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                    placeholder="X/Twitter (https://x.com/...)"
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.social_twitter ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                                <input
                                    type="url"
                                    value={formData.socialLinks?.youtube || ''}
                                    onChange={(e) => updateSocialLink('youtube', e.target.value)}
                                    placeholder="YouTube (https://youtube.com/...)"
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.social_youtube ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                                <input
                                    type="url"
                                    value={formData.socialLinks?.tiktok || ''}
                                    onChange={(e) => updateSocialLink('tiktok', e.target.value)}
                                    placeholder="TikTok (https://tiktok.com/...)"
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.social_tiktok ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                                <input
                                    type="url"
                                    value={formData.socialLinks?.linkedin || ''}
                                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                                    placeholder="LinkedIn (https://linkedin.com/...)"
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.social_linkedin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        WhatsApp para Contato
                                    </label>
                                    <input
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={handleWhatsAppChange}
                                        placeholder="11999999999"
                                        maxLength={11}
                                        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${whatsappNumber && !validateWhatsAppNumber(whatsappNumber)
                                            ? 'border-red-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    />
                                    {whatsappNumber && (
                                        <p className={`text-sm mt-1 ${validateWhatsAppNumber(whatsappNumber)
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-500'
                                            }`}>
                                            {validateWhatsAppNumber(whatsappNumber) ? (
                                                <>✅ {formatPhoneForDisplay(whatsappNumber)}</>
                                            ) : (
                                                <>❌ Número inválido. Use: DDD + número (ex: 11999999999)</>
                                            )}
                                        </p>
                                    )}
                                    {!whatsappNumber && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Digite apenas números: DDD + número (ex: 11999999999)
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Site Oficial
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.officialSiteUrl}
                                        onChange={(e) => setFormData({ ...formData, officialSiteUrl: e.target.value })}
                                        placeholder="https://seusite.com.br"
                                        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.officialSiteUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    />
                                    {errors.officialSiteUrl && (
                                        <p className="text-red-500 text-sm mt-1">{errors.officialSiteUrl}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Aviso */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium mb-1">Importante:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Seu cadastro será analisado antes de ser publicado</li>
                                        <li>Certifique-se de que todas as informações estão corretas</li>
                                        <li>Links de redes sociais devem ser URLs completas (começando com https://)</li>
                                        <li>A foto será redimensionada automaticamente</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Erro de envio */}
                        {errors.submit && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
                            </div>
                        )}

                        {/* Botão de envio */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Enviar Cadastro
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}