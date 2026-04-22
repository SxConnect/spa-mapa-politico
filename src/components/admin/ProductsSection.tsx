import { useStore } from '../../store/useStore';
import { Plus } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

export default function ProductsSection() {
  const { products, categories, addProduct } = useStore();

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      categoryId: categories[0]?.id || '',
      description: '',
      price: 0,
      hasPromotion: false,
      image: '',
      hasComplements: false,
      complementGroups: [],
      active: true,
    };
    addProduct(newProduct);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Products</h2>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {products.length === 0 ? (
          <p className="col-span-2 text-gray-500 text-center py-8">
            No products yet. Click "Add Product" to create one.
          </p>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}
