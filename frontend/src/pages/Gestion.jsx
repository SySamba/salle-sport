import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Plus, Eye, Power, PowerOff, RefreshCw, Printer, CreditCard, Edit, Trash2, Contact } from 'lucide-react';
import { formatPrice } from '../utils/format';
import MemberCard from '../components/MemberCard';

function Gestion() {
  const [activeTab, setActiveTab] = useState('members');
  const navigate = useNavigate();

  // Members
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [cardMember, setCardMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ full_name: '', sex: 'Homme', phone: '', photo: '' });

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  const [subSearch, setSubSearch] = useState('');
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ member_id: '', plan_id: '', start_date: new Date().toISOString().split('T')[0] });
  const [plans, setPlans] = useState([]);

  // Payments
  const [payments, setPayments] = useState([]);
  const [paySearch, setPaySearch] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ member_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Espèces' });
  const [error, setError] = useState('');
  const [createdMember, setCreatedMember] = useState(null);
  const [subscribingMemberId, setSubscribingMemberId] = useState(null);
  const [inlineSubForm, setInlineSubForm] = useState({ plan_id: '', start_date: new Date().toISOString().split('T')[0] });
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState({ full_name: '', sex: 'Homme', phone: '' });

  useEffect(() => {
    fetchMembers();
    fetchSubs();
    fetchPayments();
    api.get('/plans').then(r => setPlans(r.data));
  }, []);

  const fetchMembers = async () => {
    const res = await api.get('/members', { params: memberSearch ? { search: memberSearch } : {} });
    setMembers(res.data);
  };

  const fetchSubs = async () => {
    const res = await api.get('/subscriptions');
    setSubscriptions(res.data);
  };

  const fetchPayments = async () => {
    const res = await api.get('/payments');
    setPayments(res.data);
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    if (phoneExists(memberForm.phone)) {
      setError('Ce numéro de téléphone est déjà utilisé par un adhérent');
      return;
    }
    try {
      const res = await api.post('/members', memberForm);
      setShowMemberForm(false);
      setMemberForm({ full_name: '', sex: 'Homme', phone: '', photo: '' });
      setCreatedMember(res.data);
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'adhérent');
      console.error(err);
    }
  };

  const handleInlineSub = async (e, memberId) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/subscriptions', { member_id: memberId, plan_id: inlineSubForm.plan_id, start_date: inlineSubForm.start_date });
      setSubscribingMemberId(null);
      setInlineSubForm({ plan_id: '', start_date: new Date().toISOString().split('T')[0] });
      fetchSubs();
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'abonnement');
      console.error(err);
    }
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    await api.post('/subscriptions', subForm);
    setShowSubForm(false);
    fetchSubs();
    fetchMembers();
  };

  const handleRenew = async (id) => {
    await api.put(`/subscriptions/${id}/renew`);
    fetchSubs();
  };

  const handleAddPay = async (e) => {
    e.preventDefault();
    await api.post('/payments', payForm);
    setShowPayForm(false);
    fetchPayments();
  };

  const handlePrint = (payment) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Reçu ${payment.id}</title></head>
      <body style="font-family:sans-serif;max-width:400px;margin:40px auto;text-align:center">
        <h2>REÇU DE PAIEMENT</h2><hr>
        <p><strong>N°:</strong> ${payment.id}</p>
        <p><strong>Adhérent:</strong> ${payment.first_name} ${payment.last_name}</p>
        <p><strong>Montant:</strong> ${payment.amount} FCFA</p>
        <p><strong>Date:</strong> ${payment.payment_date}</p>
        <p><strong>Méthode:</strong> ${payment.payment_method}</p>
        <hr><p style="margin-top:40px;font-size:12px;color:#666">Merci pour votre confiance</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const toggleStatus = async (id, current) => {
    await api.put(`/members/${id}`, { status: current === 'Actif' ? 'Inactif' : 'Actif' });
    fetchMembers();
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Supprimer cet adhérent ?')) return;
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditMember = (m) => {
    setEditingMemberId(m.id);
    setEditMemberForm({ full_name: `${m.first_name || ''} ${m.last_name || ''}`.trim(), sex: m.sex, phone: m.phone || '', photo: m.photo || '' });
  };

  const handleEditMember = async (e, id) => {
    e.preventDefault();
    if (phoneExists(editMemberForm.phone, id)) {
      setError('Ce numéro de téléphone est déjà utilisé par un adhérent');
      return;
    }
    try {
      await api.put(`/members/${id}`, editMemberForm);
      setEditingMemberId(null);
      setError('');
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  const payTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const tabs = [
    { id: 'members', label: 'Adhérents' },
    { id: 'subscriptions', label: 'Abonnements' },
    { id: 'payments', label: 'Paiements' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion</h1>
        <p className="text-gray-500">Adhérents, abonnements et paiements</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." className="input pl-10" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} onKeyUp={fetchMembers} />
            </div>
            <button onClick={() => setShowMemberForm(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" /> Nouvel adhérent</button>
          </div>

          {createdMember && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Adhérent créé avec succès</h3>
              <p className="text-sm text-green-700 mb-1"><strong>N° :</strong> {createdMember.member_number}</p>
              <p className="text-sm text-green-700 mb-1"><strong>Mot de passe temporaire :</strong> {createdMember.temp_password}</p>
              <p className="text-xs text-green-600">Communiquez ce mot de passe au membre pour qu'il puisse se connecter à son espace.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setSubscribingMemberId(createdMember.id); setCreatedMember(null); }} className="btn-primary text-sm">S'abonner</button>
                <button onClick={() => setCreatedMember(null)} className="btn-secondary text-sm">Fermer</button>
              </div>
            </div>
          )}

          {showMemberForm && (
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="text-lg font-semibold mb-4">Nouvel adhérent</h3>
              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><label className="label">Nom complet</label><input className="input" placeholder="Prénom Nom" value={memberForm.full_name} onChange={e => setMemberForm({...memberForm, full_name: e.target.value})} required /></div>
                <div><label className="label">Sexe</label><select className="input" value={memberForm.sex} onChange={e => setMemberForm({...memberForm, sex: e.target.value})}><option value="Homme">Homme</option><option value="Femme">Femme</option></select></div>
                <div><label className="label">Téléphone</label><input className="input" placeholder="77 123 45 67" value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} /></div>
                <div className="md:col-span-2">
                  <label className="label">Photo</label>
                  <input type="file" accept="image/*" className="input" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const compressed = await resizeImage(file, 300, 300, 0.7);
                      setMemberForm({...memberForm, photo: compressed});
                    }
                  }} />
                  {memberForm.photo && <img src={memberForm.photo} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded-lg" />}
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button type="submit" className="btn-primary">Enregistrer</button>
                  <button type="button" onClick={() => setShowMemberForm(false)} className="btn-secondary">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50"><tr><th className="table-th">N°</th><th className="table-th">Nom</th><th className="table-th">Téléphone</th><th className="table-th">Abonnement</th><th className="table-th">Statut</th><th className="table-th">Actions</th></tr></thead>
              <tbody>
                {members.map(m => (
                  <>
                    {editingMemberId === m.id ? (
                      <tr key={`edit-${m.id}`} className="bg-yellow-50">
                        <td className="table-td font-mono text-xs">{m.member_number}</td>
                        <td className="table-td" colSpan={3}>
                          <form onSubmit={(e) => handleEditMember(e, m.id)} className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[180px]">
                              <label className="label text-xs">Nom complet</label>
                              <input className="input text-sm" value={editMemberForm.full_name} onChange={e => setEditMemberForm({...editMemberForm, full_name: e.target.value})} required />
                            </div>
                            <div>
                              <label className="label text-xs">Sexe</label>
                              <select className="input text-sm" value={editMemberForm.sex} onChange={e => setEditMemberForm({...editMemberForm, sex: e.target.value})}>
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                              </select>
                            </div>
                            <div>
                              <label className="label text-xs">Téléphone</label>
                              <input className="input text-sm" value={editMemberForm.phone} onChange={e => setEditMemberForm({...editMemberForm, phone: e.target.value})} />
                            </div>
                            <div>
                              <label className="label text-xs">Photo</label>
                              <div className="flex items-center gap-2">
                                <input type="file" accept="image/*" className="input text-sm py-1" onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const compressed = await resizeImage(file, 300, 300, 0.7);
                                    setEditMemberForm({...editMemberForm, photo: compressed});
                                  }
                                }} />
                                {editMemberForm.photo && <img src={editMemberForm.photo} alt="" className="w-8 h-8 rounded-full object-cover" />}
                              </div>
                            </div>
                            <div className="flex gap-2 pb-0.5">
                              <button type="submit" className="btn-primary text-sm">Enregistrer</button>
                              <button type="button" onClick={() => setEditingMemberId(null)} className="btn-secondary text-sm">Annuler</button>
                            </div>
                          </form>
                        </td>
                        <td className="table-td"><span className={`text-xs px-2 py-1 rounded-full font-medium ${m.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span></td>
                        <td className="table-td"></td>
                      </tr>
                    ) : (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="table-td font-mono text-xs">{m.member_number}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            {m.photo ? <img src={m.photo} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">{m.first_name?.[0]}{m.last_name?.[0]}</div>}
                            <span className="font-medium">{m.first_name} {m.last_name}</span>
                          </div>
                        </td>
                        <td className="table-td">{m.phone || '-'}</td>
                        <td className="table-td"><span className={`text-xs px-2 py-1 rounded-full font-medium ${m.plan_name ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{m.plan_name || 'Aucun'}</span></td>
                        <td className="table-td"><span className={`text-xs px-2 py-1 rounded-full font-medium ${m.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span></td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <button onClick={() => navigate(`/members/${m.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Voir"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => startEditMember(m)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Modifier"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteMember(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => setCardMember(m)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Carte membre"><Contact className="w-4 h-4" /></button>
                            <button onClick={() => { setSubscribingMemberId(m.id); setInlineSubForm({ plan_id: '', start_date: new Date().toISOString().split('T')[0] }); }} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="S'abonner"><CreditCard className="w-4 h-4" /></button>
                            <button onClick={() => toggleStatus(m.id, m.status)} className={`p-1.5 rounded-lg ${m.status === 'Actif' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={m.status === 'Actif' ? 'Désactiver' : 'Réactiver'}>{m.status === 'Actif' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}</button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {subscribingMemberId === m.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-green-50 border-b border-green-100">
                          <form onSubmit={(e) => handleInlineSub(e, m.id)} className="flex flex-wrap items-end gap-3">
                            <div>
                              <label className="label text-xs">Formule</label>
                              <select className="input text-sm py-1.5" value={inlineSubForm.plan_id} onChange={e => setInlineSubForm({...inlineSubForm, plan_id: e.target.value})} required>
                                <option value="">Choisir</option>
                                {plans.map(p => <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)} FCFA</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="label text-xs">Début</label>
                              <input type="date" className="input text-sm py-1.5" value={inlineSubForm.start_date} onChange={e => setInlineSubForm({...inlineSubForm, start_date: e.target.value})} required />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="btn-primary text-sm py-1.5">Enregistrer</button>
                              <button type="button" onClick={() => setSubscribingMemberId(null)} className="btn-secondary text-sm py-1.5">Annuler</button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {members.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun adhérent trouvé</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." className="input pl-10" value={subSearch} onChange={e => setSubSearch(e.target.value)} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50"><tr><th className="table-th">Adhérent</th><th className="table-th">Formule</th><th className="table-th">Début</th><th className="table-th">Fin</th><th className="table-th">Statut</th><th className="table-th">Actions</th></tr></thead>
              <tbody>
                {subscriptions.filter(s => !subSearch || s.first_name?.toLowerCase().includes(subSearch.toLowerCase()) || s.last_name?.toLowerCase().includes(subSearch.toLowerCase())).map(s => {
                  const isExpired = s.status === 'Actif' && s.end_date < new Date().toISOString().split('T')[0];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="table-td font-medium">{s.first_name} {s.last_name}<br/><span className="text-xs text-gray-400">{s.member_number}</span></td>
                      <td className="table-td">{s.plan_name}</td>
                      <td className="table-td">{s.start_date}</td>
                      <td className="table-td">{s.end_date}</td>
                      <td className="table-td"><span className={`text-xs px-2 py-1 rounded-full font-medium ${isExpired ? 'bg-orange-100 text-orange-700' : s.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isExpired ? 'Expiré' : s.status}</span></td>
                      <td className="table-td">
                        {(isExpired || s.status === 'Actif') && (
                          <button onClick={() => handleRenew(s.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Renouveler"><RefreshCw className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {subscriptions.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun abonnement trouvé</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." className="input pl-10" value={paySearch} onChange={e => setPaySearch(e.target.value)} />
            </div>
            <button onClick={() => setShowPayForm(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" /> Nouveau paiement</button>
            <div className="card py-2 px-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="font-bold text-gray-900">{formatPrice(payTotal)} FCFA</span>
            </div>
          </div>

          {showPayForm && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold mb-4">Nouveau paiement</h3>
              <form onSubmit={handleAddPay} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select className="input" value={payForm.member_id} onChange={e => setPayForm({...payForm, member_id: e.target.value})} required>
                  <option value="">Adhérent</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                </select>
                <input type="number" className="input" placeholder="Montant" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required />
                <input type="date" className="input" value={payForm.payment_date} onChange={e => setPayForm({...payForm, payment_date: e.target.value})} required />
                <select className="input" value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}>
                  <option value="Espèces">Espèces</option>
                  <option value="Carte">Carte</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile">Mobile</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Enregistrer</button>
                  <button type="button" onClick={() => setShowPayForm(false)} className="btn-secondary">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50"><tr><th className="table-th">N°</th><th className="table-th">Adhérent</th><th className="table-th">Montant</th><th className="table-th">Date</th><th className="table-th">Méthode</th><th className="table-th">Actions</th></tr></thead>
              <tbody>
                {payments.filter(p => !paySearch || p.first_name?.toLowerCase().includes(paySearch.toLowerCase()) || p.last_name?.toLowerCase().includes(paySearch.toLowerCase())).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td font-mono text-xs">#{p.id}</td>
                    <td className="table-td font-medium">{p.first_name} {p.last_name}</td>
                    <td className="table-td font-bold text-green-600">{formatPrice(p.amount)} FCFA</td>
                    <td className="table-td">{p.payment_date}</td>
                    <td className="table-td"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.payment_method}</span></td>
                    <td className="table-td">
                      <button onClick={() => handlePrint(p)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Imprimer le reçu"><Printer className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun paiement trouvé</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {cardMember && <MemberCard member={cardMember} onClose={() => setCardMember(null)} />}
    </div>
  );
}

export default Gestion;
