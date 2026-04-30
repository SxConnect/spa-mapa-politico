import { useState } from 'react';
import { LogOut, Settings, Users } from 'lucide-react';
import ConfigSection from '../components/admin/ConfigSection';
import CandidatesSection from '../components/admin/CandidatesSection';
import BackupSection from '../components/admin/BackupSection';
import SaveNotification from '../components/SaveNotification';
import { useStore } from '../store/useStore';

type Tab = 'candidates' | 'config' | 'backup';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('candidates');
  const showSaveNotification = useStore((state) => state.showSaveNotification);

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('admin-token');
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Ver Site →
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <LogOut size={20} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'candidates'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <Users size={20} />
              Candidatos
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'config'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <Settings size={20} />
              Configurações
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'backup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Backup
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'candidates' && <CandidatesSection />}
        {activeTab === 'config' && <ConfigSection />}
        {activeTab === 'backup' && <BackupSection />}
      </main>

      {/* Save Notification */}
      {showSaveNotification && <SaveNotification show={showSaveNotification} />}
    </div>
  );
}
