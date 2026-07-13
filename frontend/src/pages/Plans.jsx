import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Save, X } from 'lucide-react';
import { formatPrice } from '../utils/format';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', duration_days: '', price: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', duration_days: '', price: '', description: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (plan) => {
    setEditingId(plan.id);
    setEditForm({ name: plan.name, duration_days: plan.duration_days, price: plan.price, description: plan.description || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/plans/${editingId}`, { ...editForm, is_active: 1 });
    setEditingId(null);
    fetchPlans();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/plans', newForm);
    setShowForm(false);
    setNewForm({ name: '', duration_days: '', price: '', description: '' });
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formules & Tarifs</h1>
          <p className="text-gray-500">Gérer les prix des abonnements en FCFA</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nouvelle formule
        </button>
      </div>

      {showForm && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold mb-4">Nouvelle formule</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="label">Nom</label><input className="input" value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} required placeholder="Ex: Mensuel" /></div>
            <div><label className="label">Durée (jours)</label><input type="number" className="input" value={newForm.duration_days} onChange={e => setNewForm({...newForm, duration_days: e.target.value})} required placeholder="30" /></div>
            <div><label className="label">Prix (FCFA)</label><input type="number" className="input" value={newForm.price} onChange={e => setNewForm({...newForm, price: e.target.value})} required placeholder="15000" /></div>
            <div><label className="label">Description</label><input className="input" value={newForm.description} onChange={e => setNewForm({...newForm, description: e.target.value})} placeholder="Description..." /></div>
            <div className="md:col-span-4 flex gap-3">
              <button type="submit" className="btn-primary">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="card relative">
            {editingId === plan.id ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <div><label className="label">Nom</label><input className="input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required /></div>
                <div><label className="label">Durée (jours)</label><input type="number" className="input" value={editForm.duration_days} onChange={e => setEditForm({...editForm, duration_days: e.target.value})} required /></div>
                <div><label className="label">Prix (FCFA)</label><input type="number" className="input" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} required /></div>
                <div><label className="label">Description</label><input className="input" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary gap-1 text-sm"><Save className="w-4 h-4" /> Enregistrer</button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-secondary gap-1 text-sm"><X className="w-4 h-4" /> Annuler</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <button onClick={() => startEdit(plan)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Durée</span><span className="font-medium">{plan.duration_days} jours</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Prix</span><span className="text-xl font-bold text-primary-600">{formatPrice(plan.price)} FCFA</span></div>
                  {plan.description && <p className="text-sm text-gray-500 mt-2">{plan.description}</p>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plans;
