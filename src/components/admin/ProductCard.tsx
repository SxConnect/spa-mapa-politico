import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Product, ComplementGroup, ComplementOption } from '../../types';
import { Upload, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../utils/api';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { categories, updateProduct, deleteProduct } = useStore();
  // New products (without name) start expanded
  const [isExpanded, setIsExpanded] = useState(!product.name);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload to server and get URL
        const imageUrl = await api.uploadImage(file);
        updateProduct(product.id, { image: imageUrl });
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Erro ao fazer upload da imagem. Verifique se o servidor está rodando.');
      }
    }
  };

  const addComplementGroup = () => {
    const newGroup: ComplementGroup = {
      id: `group-${Date.now()}`,
      name: '',
      minSelection: 0,
      maxSelection: 1,
      options: [],
    };
    updateProduct(product.id, {
      complementGroups: [...product.complementGroups, newGroup],
    });
  };

  const updateComplementGroup = (groupId: string, updates: Partial<ComplementGroup>) => {
    const updatedGroups = product.complementGroups.map((group) =>
      group.id === groupId ? { ...group, ...updates } : group
    );
    updateProduct(product.id, { complementGroups: updatedGroups });
  };

  const deleteComplementGroup = (groupId: string) => {
    const updatedGroups = product.complementGroups.filter((group) => group.id !== groupId);
    updateProduct(product.id, { complementGroups: updatedGroups });
  };

  const addComplementOption = (groupId: string) => {
    const newOption: ComplementOption = {
      id: `option-${Date.now()}`,
      name: '',
      price: 0,
    };
    const updatedGroups = product.complementGroups.map((group) =>
      group.id === groupId
        ? { ...group, options: [...group.options, newOption] }
        : group
    );
    updateProduct(product.id, { complementGroups: updatedGroups });
  };

  const updateComplementOption = (
    groupId: string,
    optionId: string,
    updates: Partial<ComplementOption>
  ) => {
    const updatedGroups = product.complementGroups.map((group) =>
      group.id === groupId
        ? {
          ...group,
          options: group.options.map((option) =>
            option.id === optionId ? { ...option, ...updates } : option
          ),
        }
        : group
    );
    updateProduct(product.id, { complementGroups: updatedGroups });
  };

  const deleteComplementOption = (groupId: string, optionId: string) => {
    const updatedGroups = product.complementGroups.map((group) =>
      group.id === groupId
        ? { ...group, options: group.options.filter((option) => option.id !== optionId) }
        : group
    );
    updateProduct(product.id, { complementGroups: updatedGroups });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
        >
          {product.name || 'New Product'}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <button
          onClick={() => deleteProduct(product.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={product.categoryId}
                onChange={(e) => updateProduct(product.id, { categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (max 150 chars)
            </label>
            <textarea
              value={product.description}
              onChange={(e) => updateProduct(product.id, { description: e.target.value.slice(0, 150) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Product description"
            />
            <p className="text-xs text-gray-500 mt-1">{product.description.length}/150</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.price}
                onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.hasPromotion}
                  onChange={(e) => updateProduct(product.id, { hasPromotion: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">On Promotion</span>
              </label>
              {product.hasPromotion && (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.promotionalPrice || 0}
                  onChange={(e) => updateProduct(product.id, { promotionalPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                  placeholder="Promotional price"
                />
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product.active !== false}
                onChange={(e) => updateProduct(product.id, { active: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Produto Ativo (visível para clientes)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Desmarque para ocultar o produto sem excluí-lo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              {product.image && (
                <img
                  src={product.image}
                  alt="Product preview"
                  className="w-20 h-20 object-cover border border-gray-300 rounded-lg"
                />
              )}
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm">
                <Upload size={16} />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={product.hasComplements}
                onChange={(e) => updateProduct(product.id, { hasComplements: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Has Complements</span>
            </label>

            {product.hasComplements && (
              <div className="space-y-4 pl-6">
                <button
                  onClick={addComplementGroup}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={16} />
                  <span>Add Complement Group</span>
                </button>

                {product.complementGroups.map((group) => (
                  <div key={group.id} className="border border-gray-300 rounded-lg p-3 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateComplementGroup(group.id, { name: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Group name (e.g., Choose the bread)"
                      />
                      <button
                        onClick={() => deleteComplementGroup(group.id)}
                        className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Min Selection
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={group.minSelection}
                          onChange={(e) => updateComplementGroup(group.id, { minSelection: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Max Selection
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={group.maxSelection}
                          onChange={(e) => updateComplementGroup(group.id, { maxSelection: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => addComplementOption(group.id)}
                      className="flex items-center gap-2 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs mb-2"
                    >
                      <Plus size={14} />
                      <span>Add Option</span>
                    </button>

                    <div className="space-y-2">
                      {group.options.map((option) => (
                        <div key={option.id} className="flex gap-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => updateComplementOption(group.id, option.id, { name: e.target.value })}
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Option name"
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={option.price}
                            onChange={(e) => updateComplementOption(group.id, option.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="R$ 0.00"
                          />
                          <button
                            onClick={() => deleteComplementOption(group.id, option.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
