import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Eye, X, Calendar, Users, CreditCard, Activity, TrendingUp, AlertCircle, ChevronDown } from 'lucide-react';
import { formatPrice } from '../utils/format';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function ReportContent({
  startDate,
  endDate,
  members,
  payments,
  attendance,
  stats,
  chartData,
  activeMembers,
  totalRevenue,
  periodAttendance,
  newMembers,
  expiringCount
}) {
  const periodPayments = useMemo(() => payments.filter(p => {
    const d = new Date(p.payment_date);
    return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
  }), [payments, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-300 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rapport d'activité - Salle de Sport</h2>
        <p className="text-gray-600">Période du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}</p>
        <p className="text-gray-500 text-sm">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          title="Total adhérents"
          value={members.length}
          icon={Users}
          gradient="from-blue-500 to-indigo-600"
          accent="text-blue-600"
          subtitle={`${activeMembers} actifs`}
        />
        <SummaryCard
          title="Adhérents actifs"
          value={activeMembers}
          icon={Activity}
          gradient="from-emerald-500 to-green-600"
          accent="text-emerald-600"
          subtitle={members.length ? `${Math.round((activeMembers / members.length) * 100)}% du total` : '—'}
        />
        <SummaryCard
          title="Revenus de la période"
          value={`${formatPrice(totalRevenue)}`}
          suffix="FCFA"
          icon={CreditCard}
          gradient="from-violet-500 to-purple-600"
          accent="text-violet-600"
          subtitle={`${newMembers} nouveaux membres`}
        />
        <SummaryCard
          title="Présences de la période"
          value={periodAttendance.length}
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-600"
          accent="text-amber-600"
          subtitle="entrées enregistrées"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus mensuels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${formatPrice(value)} FCFA`} />
              <Bar dataKey="revenus" name="Revenus (FCFA)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Points clés</h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Nouveaux adhérents</span>
              <span className="font-bold text-gray-900">{newMembers}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Abonnements actifs</span>
              <span className="font-bold text-gray-900">{stats?.stats?.activeSubscriptions || 0}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Abonnements expirés</span>
              <span className="font-bold text-red-600">{stats?.stats?.expiredSubscriptions || 0}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Expirent dans 7 jours</span>
              <span className="font-bold text-orange-600">{expiringCount}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" /> Paiements récents de la période
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-th">Date</th>
                  <th className="table-th">Adhérent</th>
                  <th className="table-th">Montant</th>
                </tr>
              </thead>
              <tbody>
                {periodPayments.slice(0, 15).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                    <td className="table-td">{p.first_name} {p.last_name}</td>
                    <td className="table-td font-medium">{formatPrice(p.amount)} FCFA</td>
                  </tr>
                ))}
                {periodPayments.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Aucun paiement sur cette période</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {periodPayments.length > 15 && (
            <p className="text-xs text-gray-500 mt-2">{periodPayments.length - 15} paiements supplémentaires.</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" /> Abonnements à renouveler bientôt
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-th">Adhérent</th>
                  <th className="table-th">Formule</th>
                  <th className="table-th">Fin</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.expiringSoon || []).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-td">{s.first_name} {s.last_name}</td>
                    <td className="table-td">{s.plan_name}</td>
                    <td className="table-td">{new Date(s.end_date).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
                {expiringCount === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Aucun abonnement expirant prochainement</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const reportRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preset, setPreset] = useState('year');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const [statsRes, chartRes, membersRes, paymentsRes, attendanceRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/chart'),
        api.get('/members'),
        api.get('/payments', { params: { start_date: start, end_date: end } }),
        api.get('/attendance')
      ]);

      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthly = months.map((m, i) => ({
        month: m,
        revenus: chartRes.data.monthlyRevenue.find(r => r.month === i + 1)?.total || 0,
      }));

      setStats(statsRes.data);
      setChartData(monthly);
      setMembers(membersRes.data);
      setPayments(paymentsRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (value) => {
    setPreset(value);
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    let s, e;

    switch (value) {
      case 'current_month':
        s = new Date(y, m, 1);
        e = today;
        break;
      case 'last_month':
        s = new Date(y, m - 1, 1);
        e = new Date(y, m, 0);
        break;
      case 'last_15_days':
        s = new Date(y, m, d - 14);
        e = today;
        break;
      case 'year':
      default:
        s = new Date(y, 0, 1);
        e = today;
    }

    const sStr = s.toISOString().split('T')[0];
    const eStr = e.toISOString().split('T')[0];
    setStartDate(sStr);
    setEndDate(eStr);
    fetchData(sStr, eStr);
  };

  const handleFilter = () => {
    setPreset('custom');
    fetchData();
  };

  const periodStart = useMemo(() => new Date(startDate), [startDate]);
  const periodEnd = useMemo(() => {
    const d = new Date(endDate);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endDate]);

  const isInPeriod = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= periodStart && d <= periodEnd;
  };

  const periodAttendance = useMemo(() => attendance.filter(a => isInPeriod(a.entry_date)), [attendance, periodStart, periodEnd]);
  const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0), [payments]);

  const activeMembers = useMemo(() => members.filter(m => m.status === 'Actif').length, [members]);
  const newMembers = useMemo(() => members.filter(m => isInPeriod(m.created_at)).length, [members, periodStart, periodEnd]);
  const expiringCount = useMemo(() => stats?.expiringSoon?.length || 0, [stats]);

  const reportProps = {
    startDate,
    endDate,
    members,
    payments,
    attendance,
    stats,
    chartData,
    activeMembers,
    totalRevenue,
    periodAttendance,
    newMembers,
    expiringCount
  };

  const generatePDF = async () => {
    if (!reportRef.current) return null;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    return pdf;
  };

  const handleViewPDF = () => {
    setPreviewOpen(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const pdf = await generatePDF();
      if (!pdf) return;
      pdf.save(`rapport-salle-sport-${startDate}-${endDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500">Synthèse simple de l'activité</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleViewPDF} className="btn-secondary gap-2">
            <Eye className="w-4 h-4" /> Voir
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary gap-2">
            <Download className="w-4 h-4" /> Télécharger
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={preset}
            onChange={e => applyPreset(e.target.value)}
            className="appearance-none input pl-4 pr-10 min-w-[180px]"
          >
            <option value="year">Cette année</option>
            <option value="current_month">Ce mois</option>
            <option value="last_month">Mois dernier</option>
            <option value="last_15_days">15 derniers jours</option>
            <option value="custom">Personnalisé</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input type="date" className="outline-none text-sm" value={startDate} onChange={e => { setPreset('custom'); setStartDate(e.target.value); }} />
          <span className="text-gray-400">-</span>
          <input type="date" className="outline-none text-sm" value={endDate} onChange={e => { setPreset('custom'); setEndDate(e.target.value); }} />
        </div>
        <button onClick={handleFilter} className="btn-primary">
          Filtrer
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      <div ref={reportRef} className="bg-white md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border md:border-0 border-gray-200">
        <ReportContent {...reportProps} />
      </div>

      {previewOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 p-6 relative">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aperçu du rapport</h2>
            <ReportContent {...reportProps} />
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, suffix, subtitle, icon: Icon, gradient, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`}></div>
      <div className={`pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {suffix && <span className="text-sm font-semibold text-gray-400">{suffix}</span>}
        </div>
        {subtitle && (
          <p className={`mt-1 text-xs font-semibold ${accent}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
