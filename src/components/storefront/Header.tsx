import { useStore } from '../../store/useStore';
import { ShoppingCart } from 'lucide-react';

interface Props {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: Props) {
  const { establishment, cart } = useStore();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Header Banner Image */}
      {establishment.headerImage && (
        <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={establishment.headerImage}
            alt={`${establishment.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Navigation Bar */}
      <header
        className="sticky top-0 left-0 right-0 z-40 shadow-md"
        style={{ backgroundColor: establishment.headerBgColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {establishment.logo && (
              <img
                src={establishment.logo}
                alt={establishment.name}
                className="h-12 w-12 object-contain bg-white rounded-lg p-1"
              />
            )}
            <h1
              className="text-xl font-bold"
              style={{ color: establishment.headerTextColor }}
            >
              {establishment.name}
            </h1>
          </div>

          <button
            onClick={onCartClick}
            className="relative p-3 rounded-full transition-colors"
            style={{
              backgroundColor: `${establishment.headerTextColor}20`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${establishment.headerTextColor}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${establishment.headerTextColor}20`;
            }}
          >
            <ShoppingCart size={24} style={{ color: establishment.headerTextColor }} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
