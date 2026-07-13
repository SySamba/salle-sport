import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Plus, User, Edit, Eye, Power, PowerOff, Trash2, Contact } from 'lucide-react';
import MemberCard from '../components/MemberCard';

function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', sex: 'Homme', phone: '', photo: '' });
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', sex: 'Homme', phone: '', photo: '' });
  const [cardMember, setCardMember] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter]);

  const fetchMembers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/members', { params });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const normalizePhone = (phone) => (phone || '').replace(/\s/g, '');

  const phoneExists = (phone, excludeId = null) => {
    const digits = normalizePhone(phone);
    if (!digits) return false;
    return members.some(m => normalizePhone(m.phone) === digits && m.id !== excludeId);
  };

  const resizeImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > h) { if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; } }
          else { if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; } }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (phoneExists(formData.phone)) {
      setFormError('Ce numéro de téléphone est déjà utilisé par un adhérent');
      return;
    }
    try {
      await api.post('/members', formData);
      setShowForm(false);
      setFormData({ full_name: '', sex: 'Homme', phone: '', photo: '' });
      fetchMembers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création');
      console.error(err);
    }
  };

  const toggleStatus = async (id, current) => {
    try {
      await api.put(`/members/${id}`, { status: current === 'Actif' ? 'Inactif' : 'Actif' });
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet adhérent ?')) return;
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ full_name: `${m.first_name || ''} ${m.last_name || ''}`.trim(), sex: m.sex, phone: m.phone || '', photo: m.photo || '' });
  };

  const handleEdit = async (e, id) => {
    e.preventDefault();
    if (phoneExists(editForm.phone, id)) {
      alert('Ce numéro de téléphone est déjà utilisé par un adhérent');
      return;
    }
    try {
      await api.put(`/members/${id}`, editForm);
      setEditingId(null);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adhérents</h1>
          <p className="text-gray-500">Gestion des membres de la salle</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nouvel adhérent
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </select>
      </div>

      {showForm && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold mb-4">Nouvel adhérent</h3>
          {formError && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nom complet</label>
              <input className="input" placeholder="Prénom Nom" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Sexe</label>
              <select className="input" value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})}>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input" placeholder="77 123 45 67" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Photo</label>
              <input type="file" accept="image/*" className="input" onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const compressed = await resizeImage(file, 300, 300, 0.7);
                  setFormData({...formData, photo: compressed});
                }
              }} />
              {formData.photo && <img src={formData.photo} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded-lg" />}
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-primary">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">N°</th>
              <th className="table-th">Nom</th>
              <th className="table-th">Téléphone</th>
              <th className="table-th">Abonnement</th>
              <th className="table-th">Statut</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              editingId === m.id ? (
                <tr key={m.id} className="bg-yellow-50">
                  <td className="table-td font-mono text-xs">{m.member_number}</td>
                  <td className="table-td" colSpan={3}>
                    <form onSubmit={(e) => handleEdit(e, m.id)} className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[180px]">
                        <label className="label text-xs">Nom complet</label>
                        <input className="input text-sm" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} required />
                      </div>
                      <div>
                        <label className="label text-xs">Sexe</label>
                        <select className="input text-sm" value={editForm.sex} onChange={e => setEditForm({...editForm, sex: e.target.value})}>
                          <option value="Homme">Homme</option>
                          <option value="Femme">Femme</option>
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">Téléphone</label>
                        <input className="input text-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="label text-xs">Photo</label>
                        <div className="flex items-center gap-2">
                          <input type="file" accept="image/*" className="input text-sm py-1" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const compressed = await resizeImage(file, 300, 300, 0.7);
                              setEditForm({...editForm, photo: compressed});
                            }
                          }} />
                          {editForm.photo && <img src={editForm.photo} alt="" className="w-8 h-8 rounded-full object-cover" />}
                        </div>
                      </div>
                      <div className="flex gap-2 pb-0.5">
                        <button type="submit" className="btn-primary text-sm">Enregistrer</button>
                        <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-sm">Annuler</button>
                      </div>
                    </form>
                  </td>
                  <td className="table-td"><span className={`text-xs px-2 py-1 rounded-full font-medium ${m.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span></td>
                  <td className="table-td"></td>
                </tr>
              ) : (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td font-mono text-xs">{m.member_number}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      {m.photo ? (
                        <img src={m.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                          {m.first_name?.[0]}{m.last_name?.[0]}
                        </div>
                      )}
                      <span className="font-medium">{m.first_name} {m.last_name}</span>
                    </div>
                  </td>
                  <td className="table-td">{m.phone || '-'}</td>
                  <td className="table-td">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${m.plan_name ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.plan_name || 'Aucun'}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${m.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/members/${m.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => startEdit(m)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setCardMember(m)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Carte membre">
                        <Contact className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(m.id, m.status)} className={`p-1.5 rounded-lg transition-colors ${m.status === 'Actif' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={m.status === 'Actif' ? 'Désactiver' : 'Réactiver'}>
                        {m.status === 'Actif' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {members.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun adhérent trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {cardMember && <MemberCard member={cardMember} onClose={() => setCardMember(null)} />}
    </div>
  );
}

export default Members;
