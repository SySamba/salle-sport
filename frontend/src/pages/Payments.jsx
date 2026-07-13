import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, Plus, Printer } from 'lucide-react';
import { formatPrice } from '../utils/format';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ member_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Espèces', notes: '' });

  useEffect(() => {
    fetchPayments();
    api.get('/members').then(r => setMembers(r.data));
  }, [search, startDate, endDate]);

  const fetchPayments = async () => {
    try {
      const params = {};
      if (startDate && endDate) { params.start_date = startDate; params.end_date = endDate; }
      const res = await api.get('/payments', { params });
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/payments', formData);
    setShowForm(false);
    setFormData({ member_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Espèces', notes: '' });
    fetchPayments();
  };

  const handlePrint = (payment) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Reçu ${payment.id}</title></head>
      <body style="font-family:sans-serif;max-width:400px;margin:40px auto;text-align:center">
        <h2>REÇU DE PAIEMENT</h2>
        <hr>
        <p><strong>N°:</strong> ${payment.id}</p>
        <p><strong>Adhérent:</strong> ${payment.first_name} ${payment.last_name}</p>
        <p><strong>Montant:</strong> ${formatPrice(payment.amount)} FCFA</p>
        <p><strong>Date:</strong> ${payment.payment_date}</p>
        <p><strong>Méthode:</strong> ${payment.payment_method}</p>
        <hr>
        <p style="margin-top:40px;font-size:12px;color:#666">Merci pour votre confiance</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const filtered = payments.filter(p =>
    !search ||
    p.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.member_number?.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500">Suivi des revenus</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nouveau paiement
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input type="date" className="input w-40" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" className="input w-40" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <div className="card py-2 px-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Total:</span>
          <span className="font-bold text-gray-900">{formatPrice(total)} FCFA</span>
        </div>
      </div>

      {showForm && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold mb-4">Nouveau paiement</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select className="input" value={formData.member_id} onChange={e => setFormData({...formData, member_id: e.target.value})} required>
              <option value="">Adhérent</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
            </select>
            <input type="number" className="input" placeholder="Montant" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <input type="date" className="input" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} required />
            <select className="input" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
              <option value="Espèces">Espèces</option>
              <option value="Carte">Carte</option>
              <option value="Virement">Virement</option>
              <option value="Mobile">Mobile</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50"><tr>
            <th className="table-th">N°</th>
            <th className="table-th">Adhérent</th>
            <th className="table-th">Montant</th>
            <th className="table-th">Date</th>
            <th className="table-th">Méthode</th>
            <th className="table-th">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-td font-mono text-xs">#{p.id}</td>
                <td className="table-td font-medium">{p.first_name} {p.last_name}</td>
                <td className="table-td font-bold text-green-600">{formatPrice(p.amount)} FCFA</td>
                <td className="table-td">{p.payment_date}</td>
                <td className="table-td"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.payment_method}</span></td>
                <td className="table-td">
                  <button onClick={() => handlePrint(p)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Imprimer le reçu">
                    <Printer className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucun paiement trouvé</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;
