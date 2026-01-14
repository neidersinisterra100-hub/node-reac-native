import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Trips } from './pages/Trips';
import { Profile } from './pages/Profile';
import { RoutesPage } from './pages/Routes';
import { Login } from './pages/Login';
// import { EmptyPage } from './pages/EmptyPage';
import { Settings } from './pages/Settings';
import { Terms } from './pages/Terms';
import Reports from './pages/Reports';
import AdminCalendar from './pages/Calendar'; // Importar Calendario
import { useAuthStore } from './store/authStore';

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [checkAuth, token]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/terms"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Terms />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"  // 👈 Nueva Ruta Reportes
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AdminCalendar />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Companies />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoutesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Trips />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Redireccionar cualquier otra ruta a login o dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
