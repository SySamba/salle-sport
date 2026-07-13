import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { formatPrice } from '../utils/format';

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({ member_id: '', plan_id: '', start_date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchSubscriptions();
    api.get('/members').then(r => setMembers(r.data));
    api.get('/plans').then(r => setPlans(r.data));
  }, [search, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/subscriptions', { params });
      setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/subscriptions', formData);
    setShowForm(false);
    fetchSubscriptions();
  };

  const handleRenew = async (id) => {
    await api.put(`/subscriptions/${id}/renew`);
    fetchSubscriptions();
  };

  const filtered = subscriptions.filter(s =>
    !search ||
    s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.member_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-gray-500">Gestion des formules et abonnements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nouvel abonnement
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous</option>
          <option value="Actif">Actif</option>
          <option value="Expire">Expiré</option>
          <option value="Annule">Annulé</option>
        </select>
      </div>

      {showForm && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold mb-4">Nouvel abonnement</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="input" value={formData.member_id} onChange={e => setFormData({...formData, member_id: e.target.value})} required>
              <option value="">Adhérent</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.member_number})</option>)}
            </select>
            <select className="input" value={formData.plan_id} onChange={e => setFormData({...formData, plan_id: e.target.value})} required>
              <option value="">Formule</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)} FCFA ({p.duration_days}j)</option>)}
            </select>
            <input type="date" className="input" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-primary">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50"><tr>
            <th className="table-th">Adhérent</th>
            <th className="table-th">Formule</th>
            <th className="table-th">Début</th>
            <th className="table-th">Fin</th>
            <th className="table-th">Statut</th>
            <th className="table-th">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => {
              const isExpired = s.status === 'Actif' && s.end_date < new Date().toISOString().split('T')[0];
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{s.first_name} {s.last_name}<br/><span className="text-xs text-gray-400">{s.member_number}</span></td>
                  <td className="table-td">{s.plan_name}</td>
                  <td className="table-td">{s.start_date}</td>
                  <td className="table-td">{s.end_date}</td>
                  <td className="table-td">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${isExpired ? 'bg-orange-100 text-orange-700' : s.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isExpired ? 'Expiré' : s.status}
                    </span>
                  </td>
                  <td className="table-td">
                    {(isExpired || s.status === 'Actif') && (
                      <button onClick={() => handleRenew(s.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Renouveler">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun abonnement trouvé</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Subscriptions;
