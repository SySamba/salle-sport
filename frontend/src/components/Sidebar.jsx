import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  ScanLine,
  ClipboardList,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Dumbbell
} from 'lucide-react';

function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'admin';
  const isManager = role === 'admin' || role === 'responsable';
  const isStaff = isManager || role === 'reception';

  if (role === 'member') return null;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', allowed: isStaff },
    { to: '/gestion', icon: FolderOpen, label: 'Gestion', allowed: isManager },
    { to: '/access', icon: ScanLine, label: 'Contrôle d\'accès', allowed: isStaff },
    { to: '/attendance', icon: ClipboardList, label: 'Présences', allowed: isStaff },
    { to: '/reports', icon: BarChart3, label: 'Rapports', allowed: isManager },
  ].filter(item => item.allowed);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col no-print">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-900 leading-tight">Salle de Sport</h1>
          <p className="text-xs text-gray-500">Gestion</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}

        {isManager && (
          <NavLink
            to="/plans"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Formules & Tarifs
          </NavLink>
        )}
        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            Utilisateurs
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
