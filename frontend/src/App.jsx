import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gestion from './pages/Gestion';
import MemberDetail from './pages/MemberDetail';
import Plans from './pages/Plans';
import AccessControl from './pages/AccessControl';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Users from './pages/Users';
import MemberSpace from './pages/MemberSpace';

function ProtectedRoute({ children, adminOnly, memberOnly, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (memberOnly && user.role !== 'member') return <Navigate to="/" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/member-space" element={<ProtectedRoute memberOnly><MemberSpace /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="gestion" element={<ProtectedRoute allowedRoles={['admin', 'responsable']}><Gestion /></ProtectedRoute>} />
        <Route path="members/:id" element={<ProtectedRoute allowedRoles={['admin', 'responsable']}><MemberDetail /></ProtectedRoute>} />
        <Route path="plans" element={<ProtectedRoute adminOnly><Plans /></ProtectedRoute>} />
        <Route path="access" element={<ProtectedRoute allowedRoles={['admin', 'responsable', 'reception']}><AccessControl /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allowedRoles={['admin', 'responsable', 'reception']}><Attendance /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'responsable']}><Reports /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
