import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/Header';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeHomePage from './pages/EmployeeHomePage';
import NotFoundPage from './pages/NotFoundPage';
import { restoreSession } from './services/authService';
import { useAuthStore } from './store/authStore';
import { homePathForRole } from './utils/roles';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import EmployeeCreatePage from './pages/EmployeeCreatePage';
import EmployeeEditPage from './pages/EmployeeEditPage';
import SystemStatusPage from './pages/SystemStatusPage';

function HomeRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? homePathForRole(user.role.code) : '/login'} replace />;
}

function App() {
  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<RoleGuard allowedRoles={['ADMIN', 'HR_MANAGER']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sistema" element={<SystemStatusPage />} />
              <Route path="/empleados" element={<EmployeesPage />} />
              <Route path="/empleados/nuevo" element={<EmployeeCreatePage />} />
              <Route path="/empleados/:id" element={<EmployeeDetailPage />} />
              <Route path="/empleados/:id/editar" element={<EmployeeEditPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['EMPLOYEE']} />}>
              <Route path="/inicio" element={<EmployeeHomePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;