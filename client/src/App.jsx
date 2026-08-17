import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import { PageLoader } from './components/ui/Loader';
import MembersPage from './pages/members/MembersPage';
import RemovedMembersPage from './pages/members/RemovedMembersPage';
import SlotsPage from './pages/slots/SlotsPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';


// Import Real Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Placeholder Pages (To be built in next steps)
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-[80vh] text-center">
    <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-700">404</h1>
    <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">Page not found</p>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><AuthLayout><LoginPage /></AuthLayout></PublicRoute>} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="removed-members" element={<RemovedMembersPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="slots" element={<SlotsPage />} /> {/* Updated */}
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}