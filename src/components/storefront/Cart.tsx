import { useStore } from '../../store/useStore';
import { X, Minus, Plus, Trash2, Send } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function Cart({ onClose }: Props) {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, orderInfo, establishment } = useStore();

  const calculateItemTotal = (index: number) => {
    const item = cart[index];
    const complementsTotal = item.selectedComplements.reduce(
      (sum, group) => sum + group.options.reduce((s, opt) => s + opt.price, 0),
      0
    );
    return (item.unitPrice + complementsTotal) * item.quantity;
  };

  const totalAmount = cart.reduce((sum, _, index) => sum + calculateItemTotal(index), 0);

  const generateWhatsAppMessage = () => {
    if (!orderInfo) return '';

    let message = `*Novo Pedido*%0A%0A`;
    message += `👤 *Cliente:* ${orderInfo.customerName}%0A`;

    if (orderInfo.orderType === 'dine-in') {
      message += `📍 *Tipo:* Consumo no Local%0A`;
      if (orderInfo.tableNumber) {
        message += `🪑 *Mesa:* ${orderInfo.tableNumber}%0A`;
      }
    } else if (orderInfo.orderType === 'takeaway') {
      message += `📦 *Tipo:* Para Viagem%0A`;
    } else if (orderInfo.orderType === 'delivery') {
      message += `🚚 *Tipo:* Delivery%0A`;
      if (orderInfo.address) {
        message += `📍 *Endereço:* ${orderInfo.address}%0A`;
      }
    }

    message += `%0A*Itens:*%0A%0A`;

    cart.forEach((item, index) => {
      message += `*${item.quantity}x ${item.productName}*%0A`;
      message += `💰 R$ ${item.unitPrice.toFixed(2)}%0A`;

      if (item.selectedComplements.length > 0) {
        item.selectedComplements.forEach((group) => {
          if (group.options.length > 0) {
            message += `   _${group.groupName}:_%0A`;
            group.options.forEach((opt) => {
              message += `   • ${opt.name}`;
              if (opt.price > 0) {
                message += ` (+R$ ${opt.price.toFixed(2)})`;
              }
              message += `%0A`;
            });
          }
        });
      }

      const itemTotal = calculateItemTotal(index);
      message += `   *Subtotal: R$ ${itemTotal.toFixed(2)}*%0A%0A`;
    });

    message += `%0A💵 *TOTAL: R$ ${totalAmount.toFixed(2)}*`;

    return message;
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${establishment.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-md flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => {
                const itemTotal = calculateItemTotal(index);

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {item.selectedComplements.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {item.selectedComplements.map((group, groupIndex) => (
                          <div key={groupIndex}>
                            {group.options.length > 0 && (
                              <>
                                <p className="text-xs font-medium text-gray-700">
                                  {group.groupName}:
                                </p>
                                <ul className="text-xs text-gray-600 ml-3">
                                  {group.options.map((opt, optIndex) => (
                                    <li key={optIndex}>
                                      • {opt.name}
                                      {opt.price > 0 && ` (+R$ ${opt.price.toFixed(2)})`}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">
                        R$ {itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSendWhatsApp}
              disabled={!establishment.whatsapp}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span>Send order via WhatsApp</span>
            </button>

            {!establishment.whatsapp && (
              <p className="text-xs text-red-600 text-center">
                WhatsApp number not configured in admin panel
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
