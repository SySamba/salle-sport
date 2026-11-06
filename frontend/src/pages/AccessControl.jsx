import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, CheckCircle, XCircle, Camera, Phone, User, Calendar, RefreshCw, Upload } from 'lucide-react';

function AccessControl() {
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  const [searchMode, setSearchMode] = useState('phone');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [numberSearch, setNumberSearch] = useState('');
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const lastScanRef = useRef('');
  const skipAutoSearchRef = useRef(false);
  const phoneWrapperRef = useRef(null);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneWrapperRef.current && !phoneWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startScanner = async () => {
    if (isScanning || scannerRef.current) return;
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (decodedText === lastScanRef.current) return;
          lastScanRef.current = decodedText;
          handleScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setAccessStatus({ allowed: false, reason: 'Caméra inaccessible. Vérifiez les permissions.' });
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch (e) {}
    scannerRef.current = null;
    setIsScanning(false);
    lastScanRef.current = '';
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (isScanning) await stopScanner();
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      const decodedText = await scanner.scanFile(file, true);
      await scanner.clear();
      scannerRef.current = null;
      handleScan(decodedText);
    } catch (err) {
      console.error(err);
      setAccessStatus({ allowed: false, reason: 'QR Code illisible sur cette image' });
    }
  };

  const resetScan = () => {
    setAccessStatus(null);
    lastScanRef.current = '';
  };

  const handleScan = useCallback(async (qrData) => {
    if (loadingRef.current) return;
    setLoading(true);
    setAccessStatus(null);

    try {
      const res = await api.post('/access/verify', { qr: qrData });
      setAccessStatus({ ...res.data, time: new Date().toLocaleTimeString('fr-FR') });
    } catch (err) {
      setAccessStatus({ allowed: false, reason: err.response?.data?.message || 'QR Code invalide' });
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMember = async (member, signal) => {
    setLoading(true);
    setAccessStatus(null);
    try {
      const res = await api.post('/access/verify', { qr: member.member_number }, { signal });
      setAccessStatus({ ...res.data, time: new Date().toLocaleTimeString('fr-FR') });
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setAccessStatus({ allowed: false, reason: 'Erreur de vérification' });
    } finally {
      setLoading(false);
    }
  };

  const verifyByPhone = async (phone, signal) => {
    setLoading(true);
    setAccessStatus(null);
    try {
      const res = await api.post('/access/verify', { phone }, { signal });
      setAccessStatus({ ...res.data, time: new Date().toLocaleTimeString('fr-FR') });
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setAccessStatus({ allowed: false, reason: 'Erreur de vérification' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoneSuggestions = async (query, signal) => {
    const digits = query.replace(/\s/g, '');
    if (digits.length < 2) {
      setPhoneSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await api.get('/members/search', { params: { q: digits }, signal });
      const matches = res.data
        .filter(m => m.phone && m.phone.replace(/\s/g, '').includes(digits))
        .slice(0, 8);
      setPhoneSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setPhoneSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (member) => {
    skipAutoSearchRef.current = true;
    setPhoneSearch(member.phone);
    setPhoneSuggestions([]);
    setShowSuggestions(false);
    verifyMember(member);
  };

  useEffect(() => {
    if (searchMode !== 'phone') return;
    const query = phoneSearch.trim();
    const digits = query.replace(/\s/g, '');
    if (digits.length < 2) {
      setPhoneSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => fetchPhoneSuggestions(query, controller.signal), 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [phoneSearch, searchMode]);

  const handlePhoneSearch = async (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const query = phoneSearch.trim();
    if (!query) return;
    await searchMember(query);
  };

  const handleNumberSearch = async (e) => {
    e.preventDefault();
    const query = numberSearch.trim();
    if (!query) return;
    await searchMember(query);
  };

  const searchMember = async (query, signal) => {
    if (searchMode === 'phone') {
      await verifyByPhone(query, signal);
      return;
    }
    setLoading(true);
    setAccessStatus(null);
    try {
      const membersRes = await api.get('/members/search', { params: { q: query }, signal });
      if (membersRes.data.length === 0) {
        setAccessStatus({ allowed: false, reason: 'Adhérent non trouvé' });
        setLoading(false);
        return;
      }
      const exact = membersRes.data.find(m => m.member_number.toLowerCase() === query.toLowerCase()) || membersRes.data[0];
      await verifyMember(exact, signal);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setAccessStatus({ allowed: false, reason: 'Erreur de recherche' });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchMode !== 'phone') return;
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false;
      return;
    }
    const query = phoneSearch.trim();
    const digits = query.replace(/\s/g, '');
    if (digits.length < 9) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => searchMember(query, controller.signal), 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [phoneSearch, searchMode]);

  useEffect(() => {
    if (searchMode !== 'number') return;
    const query = numberSearch.trim();
    if (query.length < 3) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => searchMember(query, controller.signal), 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [numberSearch, searchMode]);

  const MemberAvatar = ({ member, size = 12 }) => (
    member?.photo ? (
      <img src={member.photo} alt="" className={`w-${size} h-${size} rounded-full object-cover`} />
    ) : (
      <div className={`w-${size} h-${size} bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg`}>
        {member?.first_name?.[0]}{member?.last_name?.[0]}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contrôle d'accès</h1>
        <p className="text-gray-500">Scannez un QR Code ou recherchez un adhérent</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scanner + Search */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Scanner QR Code</h3>
            </div>
            <div className="relative w-full min-h-[200px] bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              <div id="qr-reader" className="absolute inset-0 z-10"></div>
              {!isScanning && <ScanLine className="w-12 h-12 text-gray-300 z-0" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {!isScanning ? (
                <>
                  <button onClick={startScanner} className="flex-1 btn-primary gap-2">
                    <Camera className="w-5 h-5" />
                    Caméra
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 btn-secondary gap-2">
                    <Upload className="w-5 h-5" />
                    Fichier
                  </button>
                </>
              ) : (
                <button onClick={stopScanner} className="w-full btn-secondary gap-2">
                  <XCircle className="w-5 h-5" />
                  Arrêter la caméra
                </button>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          </div>

          <div className="card">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-4">
              {[
                { id: 'phone', label: 'Téléphone', icon: Phone },
                { id: 'number', label: 'N° adhérent', icon: User },
              ].map(t => (
                <button key={t.id} onClick={() => setSearchMode(t.id)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${searchMode === t.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <t.icon className="w-4 h-4 inline mr-1" />{t.label}
                </button>
              ))}
            </div>

            {searchMode === 'phone' && (
              <div ref={phoneWrapperRef} className="relative">
                <form onSubmit={handlePhoneSearch} className="flex gap-2">
                  <input className="input flex-1" placeholder="Numéro de téléphone" inputMode="tel" autoFocus value={phoneSearch} onChange={e => setPhoneSearch(e.target.value)} />
                  <button type="submit" className="btn-primary">Vérifier</button>
                </form>
                {showSuggestions && phoneSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {phoneSuggestions.map(member => (
                      <li
                        key={member.id}
                        onClick={() => selectSuggestion(member)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <span className="font-medium">{member.phone}</span>
                        <span className="text-sm text-gray-500">{member.first_name} {member.last_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {searchMode === 'number' && (
              <form onSubmit={handleNumberSearch} className="flex gap-2">
                <input className="input flex-1" placeholder="N° adhérent ou nom" autoFocus value={numberSearch} onChange={e => setNumberSearch(e.target.value)} />
                <button type="submit" className="btn-primary">Vérifier</button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Result */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Résultat de la vérification</h3>
            {accessStatus && (
              <button onClick={resetScan} className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                <RefreshCw className="w-4 h-4" /> Nouveau scan
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mb-3"></div>
              <p className="text-gray-500 text-sm">Vérification en cours...</p>
            </div>
          )}

          {!loading && !accessStatus && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ScanLine className="w-12 h-12 mb-3" />
              <p>Présentez un QR Code ou recherchez un adhérent</p>
              <p className="text-sm mt-1">La photo du membre s'affichera ici</p>
            </div>
          )}

          {!loading && accessStatus?.allowed && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-green-700">Accès autorisé</h4>
                  <p className="text-sm text-green-600">{accessStatus.time}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="flex flex-col items-center text-center">
                  {accessStatus.member?.photo ? (
                    <img src={accessStatus.member.photo} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3" />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-4 border-white shadow-lg mb-3">
                      {accessStatus.member?.first_name?.[0]}{accessStatus.member?.last_name?.[0]}
                    </div>
                  )}
                  <h4 className="text-xl font-bold text-gray-900">{accessStatus.member?.first_name} {accessStatus.member?.last_name}</h4>
                  <p className="text-sm text-gray-500">{accessStatus.member?.member_number}</p>
                </div>

                <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                  <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-medium">{accessStatus.member?.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Formule</span><span className="font-medium text-green-700">{accessStatus.subscription?.plan_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Expire le</span><span className="font-medium">{accessStatus.subscription?.end_date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Statut</span><span className="font-medium text-green-700">{accessStatus.member?.status}</span></div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium">Vérification de l'agent :</p>
                <p>Confirmez que la photo correspond à la personne présente avant d'autoriser l'entrée.</p>
              </div>
            </div>
          )}

          {!loading && accessStatus && !accessStatus.allowed && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-red-700">Accès refusé</h4>
                  <p className="text-sm text-red-600">{accessStatus.reason}</p>
                </div>
              </div>

              {accessStatus.member && (
                <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    {accessStatus.member?.photo ? (
                      <img src={accessStatus.member.photo} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3" />
                    ) : (
                      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-4 border-white shadow-lg mb-3">
                        {accessStatus.member?.first_name?.[0]}{accessStatus.member?.last_name?.[0]}
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-gray-900">{accessStatus.member?.first_name} {accessStatus.member?.last_name}</h4>
                    <p className="text-sm text-gray-500">{accessStatus.member?.member_number}</p>
                  </div>

                  <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                    <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-medium">{accessStatus.member?.phone || '-'}</span></div>
                    {accessStatus.subscription && (
                      <>
                        <div className="flex justify-between"><span className="text-gray-500">Formule</span><span className="font-medium">{accessStatus.subscription?.plan_name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Expire le</span><span className="font-medium text-red-600">{accessStatus.subscription?.end_date}</span></div>
                      </>
                    )}
                    <div className="flex justify-between"><span className="text-gray-500">Statut membre</span><span className={`font-medium ${accessStatus.member?.status === 'Actif' ? 'text-green-700' : 'text-red-600'}`}>{accessStatus.member?.status}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccessControl;
