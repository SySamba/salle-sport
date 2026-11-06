import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, Calendar, CreditCard, Clock, Dumbbell, Phone, MapPin, AlertCircle } from 'lucide-react';
import { formatPrice } from '../utils/format';

function MemberSpace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'member') {
      navigate('/login');
      return;
    }
    fetchMemberData();
  }, [user]);

  const fetchMemberData = async () => {
    try {
      const res = await api.get(`/members/${user.id}`);
      setMember(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Impossible de charger vos informations.
      </div>
    );
  }

  const activeSub = member.subscriptions?.find(s => s.status === 'Actif' && s.end_date >= new Date().toISOString().split('T')[0]);
  const isExpired = member.subscriptions?.some(s => s.status === 'Actif' && s.end_date < new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Mon Espace</h1>
              <p className="text-xs text-gray-500">Salle de Sport</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {member.member.photo ? (
              <img src={member.member.photo} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-primary-100" />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl">
                {member.member.first_name?.[0]}{member.member.last_name?.[0]}
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{member.member.first_name} {member.member.last_name}</h2>
              <p className="text-gray-500 text-sm mt-1">{member.member.member_number}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400" /> {member.member.phone || '-'}</span>
                {member.member.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {member.member.address}</span>}
              </div>
              <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-medium ${member.member.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {member.member.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" /> Mon QR Code
          </h3>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <QRCodeSVG value={member.member.qr_code || member.member.member_number} size={180} />
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center max-w-xs">
              Présentez ce QR Code à l'entrée de la salle.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" /> Mon Abonnement
          </h3>
          {activeSub ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Formule</p>
                  <p className="text-lg font-bold text-green-700">{activeSub.plan_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Expire le</p>
                  <p className="font-bold text-gray-900">{activeSub.end_date}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Début</p>
                  <p className="font-medium">{activeSub.start_date}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Prix</p>
                  <p className="font-medium">{formatPrice(activeSub.price)} FCFA</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border ${isExpired ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${isExpired ? 'text-orange-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${isExpired ? 'text-orange-700' : 'text-gray-700'}`}>
                    {isExpired ? 'Votre abonnement a expiré' : 'Aucun abonnement actif'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Contactez l'accueil pour renouveler.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" /> Mes Présences
          </h3>
          {member.attendance?.length > 0 ? (
            <div className="space-y-2">
              {member.attendance.slice(0, 10).map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{a.entry_date}</span>
                  <span className="text-xs text-gray-500">{a.entry_time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucune présence enregistrée</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default MemberSpace;
