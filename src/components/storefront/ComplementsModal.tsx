import { useState } from 'react';
import { Product, CartItem } from '../../types';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';

interface Props {
  product: Product;
  onClose: () => void;
  primaryColor: string;
}

export default function ComplementsModal({ product, onClose, primaryColor }: Props) {
  const { addToCart } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupId: string]: string[];
  }>({});

  const handleOptionToggle = (groupId: string, optionId: string, maxSelection: number) => {
    setSelectedOptions((prev) => {
      const currentSelections = prev[groupId] || [];
      const isSelected = currentSelections.includes(optionId);

      if (isSelected) {
        return {
          ...prev,
          [groupId]: currentSelections.filter((id) => id !== optionId),
        };
      } else {
        if (currentSelections.length >= maxSelection) {
          if (maxSelection === 1) {
            return { ...prev, [groupId]: [optionId] };
          }
          return prev;
        }
        return {
          ...prev,
          [groupId]: [...currentSelections, optionId],
        };
      }
    });
  };

  const canAddToCart = () => {
    return product.complementGroups.every((group) => {
      const selections = selectedOptions[group.id] || [];
      return selections.length >= group.minSelection && selections.length <= group.maxSelection;
    });
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;

    const complementsForCart = product.complementGroups.map((group) => {
      const selections = selectedOptions[group.id] || [];
      const options = selections
        .map((optionId) => {
          const option = group.options.find((o) => o.id === optionId);
          return option ? { name: option.name, price: option.price } : null;
        })
        .filter((o) => o !== null) as { name: string; price: number }[];

      return {
        groupName: group.name,
        options,
      };
    });

    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.hasPromotion && product.promotionalPrice
        ? product.promotionalPrice
        : product.price,
      selectedComplements: complementsForCart,
    };

    addToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {product.complementGroups.map((group) => {
            const selections = selectedOptions[group.id] || [];
            const isValid = selections.length >= group.minSelection && selections.length <= group.maxSelection;

            return (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    {group.minSelection === group.maxSelection
                      ? `Select exactly ${group.minSelection}`
                      : `Select ${group.minSelection} to ${group.maxSelection}`}
                  </p>
                  {!isValid && selections.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {selections.length < group.minSelection
                        ? `Select at least ${group.minSelection - selections.length} more`
                        : `Remove ${selections.length - group.maxSelection} option(s)`}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isSelected = selections.includes(option.id);
                    const canSelect = selections.length < group.maxSelection || isSelected;

                    return (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : canSelect
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={group.maxSelection === 1 ? 'radio' : 'checkbox'}
                            checked={isSelected}
                            onChange={() => handleOptionToggle(group.id, option.id, group.maxSelection)}
                            disabled={!canSelect && !isSelected}
                            className="w-4 h-4"
                            style={{ accentColor: primaryColor }}
                          />
                          <span className="text-gray-900">{option.name}</span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm text-gray-600">
                            + R$ {option.price.toFixed(2)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className="w-full px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: canAddToCart() ? primaryColor : '#9ca3af' }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
