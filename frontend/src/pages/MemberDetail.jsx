import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer, Plus, RefreshCw } from 'lucide-react';
import { formatPrice } from '../utils/format';

function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [member, setMember] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [subForm, setSubForm] = useState({ plan_id: '', start_date: new Date().toISOString().split('T')[0] });
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Espèces', notes: '' });

  useEffect(() => {
    fetchData();
    api.get('/plans').then(r => setPlans(r.data));
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/members/${id}`);
      setMember(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    await api.post('/subscriptions', { member_id: id, ...subForm });
    setShowSubForm(false);
    fetchData();
  };

  const handleAddPay = async (e) => {
    e.preventDefault();
    const sub = member.subscriptions.find(s => s.status === 'Actif');
    await api.post('/payments', { member_id: id, subscription_id: sub?.id || null, ...payForm });
    setShowPayForm(false);
    fetchData();
  };

  const handleRenew = async (subId) => {
    await api.put(`/subscriptions/${subId}/renew`);
    fetchData();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!member) return <div className="flex items-center justify-center h-64">Chargement...</div>;

  const activeSub = member.subscriptions.find(s => s.status === 'Actif' && s.end_date >= new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/members')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{member.member.first_name} {member.member.last_name}</h1>
            <p className="text-gray-500">{member.member.member_number}</p>
          </div>
        </div>
        <button onClick={handlePrint} className="btn-secondary gap-2">
          <Printer className="w-4 h-4" /> Imprimer
        </button>
      </div>

      <div ref={printRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center">
            {member.member.photo ? (
              <img src={member.member.photo} alt="" className="w-24 h-24 rounded-full object-cover mb-4" />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl mb-4">
                {member.member.first_name[0]}{member.member.last_name[0]}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{member.member.first_name} {member.member.last_name}</h3>
            <span className={`mt-2 text-xs px-3 py-1 rounded-full font-medium ${member.member.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {member.member.status}
            </span>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sexe</span><span className="font-medium">{member.member.sex}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-medium">{member.member.phone || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Inscrit le</span><span className="font-medium">{new Date(member.member.created_at).toLocaleDateString('fr-FR')}</span></div>
          </div>
          <div className="mt-6 flex justify-center">
            <QRCodeSVG value={member.member.qr_code || member.member.member_number} size={128} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4 no-print">
              <h3 className="text-lg font-semibold text-gray-900">Abonnements</h3>
              <button onClick={() => setShowSubForm(!showSubForm)} className="btn-primary gap-2 text-sm">
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
            {showSubForm && (
              <form onSubmit={handleAddSub} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 bg-primary-50 rounded-lg no-print">
                <select className="input" value={subForm.plan_id} onChange={e => setSubForm({...subForm, plan_id: e.target.value})} required>
                  <option value="">Formule</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)} FCFA)</option>)}
                </select>
                <input type="date" className="input" value={subForm.start_date} onChange={e => setSubForm({...subForm, start_date: e.target.value})} required />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm">Enregistrer</button>
                  <button type="button" onClick={() => setShowSubForm(false)} className="btn-secondary text-sm">Annuler</button>
                </div>
              </form>
            )}
            <div className="space-y-2">
              {member.subscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{sub.plan_name}</p>
                    <p className="text-xs text-gray-500">{sub.start_date} → {sub.end_date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sub.status === 'Actif' && sub.end_date >= new Date().toISOString().split('T')[0] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.status === 'Actif' && sub.end_date >= new Date().toISOString().split('T')[0] ? 'Actif' : 'Expiré'}
                    </span>
                    <button onClick={() => handleRenew(sub.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg no-print" title="Renouveler">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {member.subscriptions.length === 0 && <p className="text-sm text-gray-500">Aucun abonnement</p>}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4 no-print">
              <h3 className="text-lg font-semibold text-gray-900">Paiements</h3>
              <button onClick={() => setShowPayForm(!showPayForm)} className="btn-primary gap-2 text-sm">
                <Plus className="w-4 h-4" /> Enregistrer
              </button>
            </div>
            {showPayForm && (
              <form onSubmit={handleAddPay} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-green-50 rounded-lg no-print">
                <input type="number" className="input" placeholder="Montant" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required />
                <input type="date" className="input" value={payForm.payment_date} onChange={e => setPayForm({...payForm, payment_date: e.target.value})} required />
                <select className="input" value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}>
                  <option value="Espèces">Espèces</option>
                  <option value="Carte">Carte</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile">Mobile</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm">Enregistrer</button>
                  <button type="button" onClick={() => setShowPayForm(false)} className="btn-secondary text-sm">Annuler</button>
                </div>
              </form>
            )}
            <div className="space-y-2">
              {member.payments.map(pay => (
                <div key={pay.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{formatPrice(pay.amount)} FCFA</p>
                    <p className="text-xs text-gray-500">{pay.payment_date} · {pay.payment_method}</p>
                  </div>
                  {pay.notes && <span className="text-xs text-gray-400">{pay.notes}</span>}
                </div>
              ))}
              {member.payments.length === 0 && <p className="text-sm text-gray-500">Aucun paiement</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des présences</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {member.attendance.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{a.entry_date}</span>
                  <span className="text-xs text-gray-500">{a.entry_time}</span>
                </div>
              ))}
              {member.attendance.length === 0 && <p className="text-sm text-gray-500">Aucune présence</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDetail;
