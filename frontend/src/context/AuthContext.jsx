import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Try admin first, then member
      api.get('/auth/me')
        .then(res => setUser({ ...res.data, role: res.data.role || 'admin' }))
        .catch(() => {
          api.get('/auth/member-me')
            .then(res => setUser({ ...res.data, role: 'member' }))
            .catch(() => localStorage.removeItem('token'));
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password, type = 'admin') => {
    if (type === 'member') {
      const res = await api.post('/auth/member-login', { phone: username, password });
      localStorage.setItem('token', res.data.token);
      setUser({ ...res.data.user, role: 'member' });
      return res.data;
    }
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser({ ...res.data.user, role: res.data.user.role || 'admin' });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin' || user?.role === 'responsable' || user?.role === 'reception';
  const isManager = () => user?.role === 'admin' || user?.role === 'responsable';
  const isMember = () => user?.role === 'member';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, isMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
