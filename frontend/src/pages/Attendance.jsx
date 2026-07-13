import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, Calendar } from 'lucide-react';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance', { params: { date: dateFilter } });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = attendance.filter(a =>
    !search ||
    a.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.member_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Présences</h1>
          <p className="text-gray-500">Suivi des entrées quotidiennes</p>
        </div>
        <div className="card py-2 px-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Total aujourd'hui</p>
            <p className="text-xl font-bold text-gray-900">{attendance.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input type="date" className="input w-40" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50"><tr>
            <th className="table-th">N°</th>
            <th className="table-th">Adhérent</th>
            <th className="table-th">Date</th>
            <th className="table-th">Heure d'entrée</th>
          </tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="table-td font-mono text-xs">{a.member_number}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                      {a.first_name?.[0]}{a.last_name?.[0]}
                    </div>
                    <span className="font-medium">{a.first_name} {a.last_name}</span>
                  </div>
                </td>
                <td className="table-td">{a.entry_date}</td>
                <td className="table-td font-mono">{a.entry_time}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Aucune présence enregistrée</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
