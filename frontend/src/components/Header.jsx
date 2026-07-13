import { useAuth } from '../context/AuthContext';
import { Bell, User } from 'lucide-react';

function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 no-print">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Bonjour, {user?.full_name || 'Utilisateur'}
        </h2>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" />
        </div>
      </div>
    </header>
  );
}

export default Header;
