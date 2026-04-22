import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Save, Upload, X } from 'lucide-react';

export default function ConfigSection() {
    const config = useStore((state) => state.config);
    const updateConfig = useStore((state) => state.updateConfig);

    const [formData, setFormData] = useState(config);
    const [logoPreview, setLogoPreview] = useState(config.logo);
    const [headerImagePreview, setHeaderImagePreview] = useState(config.headerImage);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);
            setFormData({ ...formData, logo: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setHeaderImagePreview(base64);
            setFormData({ ...formData, headerImage: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateConfig(formData);
        alert('Configurações salvas com sucesso!');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Configurações Gerais
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do Projeto
                    </label>
                    <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                    />
                </div>

                {/* Logo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo
                    </label>
                    <div className="flex items-center gap-4">
                        {logoPreview && (
                            <div className="relative">
                                <img src={logoPreview} alt="Logo" className="h-20 w-auto rounded" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLogoPreview('');
                                        setFormData({ ...formData, logo: '' });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Upload size={20} />
                            {logoPreview ? 'Trocar Logo' : 'Upload Logo'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Header Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imagem do Header
                    </label>
                    <div className="flex items-center gap-4">
                        {headerImagePreview && (
                            <div className="relative">
                                <img src={headerImagePreview} alt="Header" className="h-20 w-auto rounded" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHeaderImagePreview('');
                                        setFormData({ ...formData, headerImage: '' });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Upload size={20} />
                            {headerImagePreview ? 'Trocar Imagem' : 'Upload Imagem'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleHeaderImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Map Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título do Mapa
                    </label>
                    <input
                        type="text"
                        value={formData.mapTitle}
                        onChange={(e) => setFormData({ ...formData, mapTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Mapa do Brasil"
                        required
                    />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cor Primária
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="h-10 w-20 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cor Secundária
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                className="h-10 w-20 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Map Colors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mapa - Estado Vazio
                        </label>
                        <input
                            type="color"
                            value={formData.mapColorEmpty}
                            onChange={(e) => setFormData({ ...formData, mapColorEmpty: e.target.value })}
                            className="h-10 w-full rounded cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mapa - Com Candidatos
                        </label>
                        <input
                            type="color"
                            value={formData.mapColorFilled}
                            onChange={(e) => setFormData({ ...formData, mapColorFilled: e.target.value })}
                            className="h-10 w-full rounded cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mapa - Hover
                        </label>
                        <input
                            type="color"
                            value={formData.mapColorHover}
                            onChange={(e) => setFormData({ ...formData, mapColorHover: e.target.value })}
                            className="h-10 w-full rounded cursor-pointer"
                        />
                    </div>
                </div>

                {/* About Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Texto Sobre
                    </label>
                    <textarea
                        value={formData.aboutText}
                        onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Texto do Rodapé
                        </label>
                        <input
                            type="text"
                            value={formData.footerText}
                            onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contato do Rodapé
                        </label>
                        <input
                            type="text"
                            value={formData.footerContact}
                            onChange={(e) => setFormData({ ...formData, footerContact: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="contato@exemplo.com"
                        />
                    </div>
                </div>

                {/* Theme */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tema
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="light"
                                checked={formData.theme === 'light'}
                                onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
                                className="w-4 h-4"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Claro</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="dark"
                                checked={formData.theme === 'dark'}
                                onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
                                className="w-4 h-4"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Escuro</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                >
                    <Save size={20} />
                    Salvar Configurações
                </button>
            </form>
        </div>
    );
}
