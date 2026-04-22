import { Category, Product } from '../../types';
import ProductCard from './ProductCard';

interface Props {
  categories: Category[];
  products: Product[];
  categoryRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  primaryColor: string;
}

export default function ProductGrid({ categories, products, categoryRefs, primaryColor }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {categories.map((category) => {
        const categoryProducts = products.filter((p) =>
          p.categoryId === category.id &&
          p.active !== false
        );

        if (categoryProducts.length === 0) return null;

        return (
          <div
            key={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {category.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          </div>
        );
      })}

      {categories.every(
        (cat) => !products.some((p) => p.categoryId === cat.id)
      ) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available yet.</p>
          </div>
        )}
    </div>
  );
}
