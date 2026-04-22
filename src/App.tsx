import { useEffect } from 'react';
import { useStore } from './store/useStore';
import AdminPanel from './pages/AdminPanel';
import Storefront from './pages/Storefront';
import Login from './pages/Login';
import CandidateRegistration from './pages/CandidateRegistration';

function App() {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simple routing without React Router
  const path = window.location.pathname;

  // Check authentication for admin
  const isAuthenticated = localStorage.getItem('admin-token');

  if (path === '/login') {
    return <Login />;
  }

  if (path === '/form') {
    return <CandidateRegistration />;
  }

  if (path === '/admin') {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }
    return <AdminPanel />;
  }

  // Default: public storefront (SPA)
  return <Storefront />;
}

export default App;
