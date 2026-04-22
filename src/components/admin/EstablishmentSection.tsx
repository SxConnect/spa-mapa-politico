import { useStore } from '../../store/useStore';
import { Upload } from 'lucide-react';
import { api } from '../../utils/api';

export default function EstablishmentSection() {
  const { establishment, updateEstablishment } = useStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'headerImage') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload to server and get URL
        const imageUrl = await api.uploadImage(file);
        updateEstablishment({ [type]: imageUrl });
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Erro ao fazer upload da imagem. Verifique se o servidor está rodando.');
      }
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Establishment Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Establishment Name
          </label>
          <input
            type="text"
            value={establishment.name}
            onChange={(e) => updateEstablishment({ name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Restaurant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number
          </label>
          <input
            type="text"
            value={establishment.whatsapp}
            onChange={(e) => updateEstablishment({ whatsapp: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5521999999999"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tema da Loja
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={establishment.theme === 'light'}
                onChange={(e) => updateEstablishment({ theme: e.target.value as 'light' | 'dark' })}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm font-medium text-gray-700">☀️ Claro</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={establishment.theme === 'dark'}
                onChange={(e) => updateEstablishment({ theme: e.target.value as 'light' | 'dark' })}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm font-medium text-gray-700">🌙 Escuro</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Este tema será aplicado para todos os clientes que acessarem sua loja
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={establishment.primaryColor}
              onChange={(e) => updateEstablishment({ primaryColor: e.target.value })}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={establishment.primaryColor}
              onChange={(e) => updateEstablishment({ primaryColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={establishment.secondaryColor}
              onChange={(e) => updateEstablishment({ secondaryColor: e.target.value })}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={establishment.secondaryColor}
              onChange={(e) => updateEstablishment({ secondaryColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Header Background Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={establishment.headerBgColor}
              onChange={(e) => updateEstablishment({ headerBgColor: e.target.value })}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={establishment.headerBgColor}
              onChange={(e) => updateEstablishment({ headerBgColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Header Text Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={establishment.headerTextColor}
              onChange={(e) => updateEstablishment({ headerTextColor: e.target.value })}
              className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={establishment.headerTextColor}
              onChange={(e) => updateEstablishment({ headerTextColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo
          </label>
          <div className="flex items-center gap-4">
            {establishment.logo && (
              <img
                src={establishment.logo}
                alt="Logo preview"
                className="w-24 h-24 object-contain border border-gray-300 rounded-lg"
              />
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload size={20} />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500">Recommended: 200x200px (square)</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Header Banner Image
          </label>
          <div className="flex flex-col gap-4">
            {establishment.headerImage && (
              <img
                src={establishment.headerImage}
                alt="Header banner preview"
                className="w-full max-w-2xl h-48 object-cover border border-gray-300 rounded-lg"
              />
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
                <Upload size={20} />
                <span>Upload Header Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'headerImage')}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500">Recommended: 1920x400px (landscape)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
