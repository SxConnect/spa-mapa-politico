import { useState } from 'react';
import { Product, CartItem } from '../../types';
import { useStore } from '../../store/useStore';
import ComplementsModal from './ComplementsModal';

interface Props {
  product: Product;
  primaryColor: string;
}

export default function ProductCard({ product, primaryColor }: Props) {
  const { addToCart } = useStore();
  const [showComplements, setShowComplements] = useState(false);

  const handleAddToCart = () => {
    if (product.hasComplements && product.complementGroups.length > 0) {
      setShowComplements(true);
    } else {
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.hasPromotion && product.promotionalPrice
          ? product.promotionalPrice
          : product.price,
        selectedComplements: [],
      };
      addToCart(cartItem);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {product.image && (
          <div className="w-full h-40 overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-end justify-between">
            <div>
              {product.hasPromotion && product.promotionalPrice ? (
                <div>
                  <p className="text-xs text-gray-500 line-through">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className="text-lg font-bold" style={{ color: primaryColor }}>
                    R$ {product.promotionalPrice.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-900">
                  R$ {product.price.toFixed(2)}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {showComplements && (
        <ComplementsModal
          product={product}
          onClose={() => setShowComplements(false)}
          primaryColor={primaryColor}
        />
      )}
    </>
  );
}
