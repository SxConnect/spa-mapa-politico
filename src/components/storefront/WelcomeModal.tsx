import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: Props) {
  const { setOrderInfo } = useStore();
  const [name, setName] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setOrderInfo({
      customerName: name,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      address: orderType === 'delivery' ? address : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bem-vindo!</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual é o seu nome?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Pedido
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('dine-in')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${orderType === 'dine-in'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                No Local
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${orderType === 'takeaway'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                Retirada
              </button>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${orderType === 'delivery'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                Delivery
              </button>
            </div>
          </div>

          {orderType === 'dine-in' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Mesa
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o número da mesa"
              />
            </div>
          )}

          {orderType === 'delivery' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de Entrega
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Digite seu endereço de entrega"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Iniciar Pedido
          </button>
        </form>
      </div>
    </div>
  );
}
