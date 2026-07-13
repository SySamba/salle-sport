import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Shield, User, KeyRound } from 'lucide-react';

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showReset, setShowReset] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '', email: '', role: 'reception' });
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/users', formData);
    setShowForm(false);
    setFormData({ username: '', password: '', full_name: '', email: '', role: 'reception' });
    fetchUsers();
  };

  const handleReset = async (e) => {
    e.preventDefault();
    await api.put(`/users/${showReset}/reset-password`, { password: resetPassword });
    setShowReset(null);
    setResetPassword('');
  };

  const toggleStatus = async (id, current) => {
    await api.put(`/users/${id}`, { is_active: current ? 0 : 1 });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500">Gestion des comptes d'accès</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold mb-4">Nouvel utilisateur</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nom d'utilisateur</label>
              <input className="input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
            <div>
              <label className="label">Nom complet</label>
              <input className="input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Rôle</label>
              <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="reception">Agent d'accueil</option>
                <option value="responsable">Responsable</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {showReset && (
        <div className="card bg-orange-50 border-orange-200">
          <h3 className="text-lg font-semibold mb-4">Réinitialiser le mot de passe</h3>
          <form onSubmit={handleReset} className="flex gap-3">
            <input type="password" className="input max-w-xs" placeholder="Nouveau mot de passe" value={resetPassword} onChange={e => setResetPassword(e.target.value)} required />
            <button type="submit" className="btn-primary">Réinitialiser</button>
            <button type="button" onClick={() => setShowReset(null)} className="btn-secondary">Annuler</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50"><tr>
            <th className="table-th">Utilisateur</th>
            <th className="table-th">Nom complet</th>
            <th className="table-th">Email</th>
            <th className="table-th">Rôle</th>
            <th className="table-th">Statut</th>
            <th className="table-th">Actions</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{u.username}</td>
                <td className="table-td">{u.full_name}</td>
                <td className="table-td">{u.email || '-'}</td>
                <td className="table-td">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'responsable' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'admin' ? 'Admin' : u.role === 'responsable' ? 'Responsable' : 'Accueil'}
                  </span>
                </td>
                <td className="table-td">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowReset(u.id)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg" title="Réinitialiser MDP">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStatus(u.id, u.is_active)} className={`p-1.5 rounded-lg ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={u.is_active ? 'Désactiver' : 'Activer'}>
                      {u.is_active ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
