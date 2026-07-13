import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CalendarX,
  ClipboardList,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '../utils/format';

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600',
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/chart')
      ]);
      setStats(statsRes.data);

      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const data = months.map((m, i) => ({
        month: m,
        revenue: chartRes.data.monthlyRevenue.find(r => r.month === i + 1)?.total || 0,
        attendance: chartRes.data.monthlyAttendance.find(a => a.month === i + 1)?.total || 0,
      }));
      setChartData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500">Vue d'ensemble de votre salle de sport</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total adhérents" value={stats?.stats.totalMembers || 0} icon={Users} color="blue" />
        <StatCard title="Adhérents actifs" value={stats?.stats.activeMembers || 0} icon={UserCheck} color="green" />
        <StatCard title="Abonnements actifs" value={stats?.stats.activeSubscriptions || 0} icon={CalendarCheck} color="purple" />
        <StatCard title="Abonnements expirés" value={stats?.stats.expiredSubscriptions || 0} icon={CalendarX} color="red" />
        <StatCard title="Présences aujourd'hui" value={stats?.stats.todayAttendance || 0} icon={ClipboardList} color="teal" />
        <StatCard title="Revenus aujourd'hui" value={`${formatPrice(stats?.stats.todayRevenue)} FCFA`} icon={TrendingUp} color="orange" />
        <StatCard title="Revenus du mois" value={`${formatPrice(stats?.stats.monthRevenue)} FCFA`} icon={TrendingUp} color="blue" />
        <StatCard title="Revenus de l'année" value={`${formatPrice(stats?.stats.yearRevenue)} FCFA`} icon={TrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus mensuels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${formatPrice(value)} FCFA`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Expirations prochaines</h3>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {stats?.expiringSoon?.length === 0 && (
              <p className="text-sm text-gray-500">Aucune expiration dans les 7 jours</p>
            )}
            {stats?.expiringSoon?.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sub.first_name} {sub.last_name}</p>
                  <p className="text-xs text-gray-500">{sub.plan_name}</p>
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  {sub.end_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux adhérents</h3>
          <div className="space-y-3">
            {stats?.recentMembers?.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {m.photo ? (
                  <img src={m.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                    {m.first_name[0]}{m.last_name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-gray-500">{m.member_number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Derniers paiements</h3>
          <div className="space-y-3">
            {stats?.recentPayments?.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-gray-500">{p.payment_date}</p>
                </div>
                <span className="text-sm font-bold text-green-600">+{formatPrice(p.amount)} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
