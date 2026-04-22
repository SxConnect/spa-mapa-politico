import { useStore } from '../../store/useStore';
import { Category } from '../../types';

interface Props {
  categories: Category[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onCategoryClick }: Props) {
  const { establishment } = useStore();

  if (categories.length === 0) return null;

  return (
    <nav className="sticky top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all"
              style={{
                backgroundColor: activeCategory === category.id ? establishment.primaryColor : 'transparent',
                color: activeCategory === category.id ? 'white' : '#374151',
                border: activeCategory === category.id ? 'none' : '1px solid #d1d5db',
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
