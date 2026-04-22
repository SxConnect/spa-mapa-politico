import { useStore } from '../../store/useStore';
import { Plus, Trash2 } from 'lucide-react';

export default function CategoriesSection() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  const handleAddCategory = () => {
    addCategory({
      id: `cat-${Date.now()}`,
      name: '',
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Product Categories</h2>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No categories yet. Click "Add Category" to create one.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategory(category.id, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Category name"
              />
              <button
                onClick={() => deleteCategory(category.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
