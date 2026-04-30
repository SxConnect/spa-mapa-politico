import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface Props {
    show?: boolean;
    message?: string;
}

export default function SaveNotification({ show = false, message = 'Salvo com sucesso!' }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-1">
                    <Check size={20} />
                </div>
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
}
