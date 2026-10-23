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
import EmployeeLinkUserPage from './pages/EmployeeLinkUserPage';
import EmployeeCreatePage from './pages/EmployeeCreatePage';
import EmployeeEditPage from './pages/EmployeeEditPage';
import SystemStatusPage from './pages/SystemStatusPage';
import EmployeesSummaryPage from './pages/EmployeesSummaryPage';
import MyProfilePage from './pages/MyProfilePage';
import MyAcademicRecordsPage from './pages/MyAcademicRecordsPage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import AcademicSummaryPage from './pages/AcademicSummaryPage';
import OrganizationPage from './pages/OrganizationPage';
import UsersPage from './pages/UsersPage';
import EmployeesSectionLayout from './layouts/EmployeesSectionLayout';
import DocumentTypesPage from './pages/DocumentTypesPage';
import { Toaster } from 'react-hot-toast';
import TeamPage from './pages/TeamPage';

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
      <Toaster
        position="top-right"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#ffffff',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            padding: '0.75rem 1rem',
            maxWidth: '24rem',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#ffffff' } },
          error: { duration: 10000, iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/sistema" element={<SystemStatusPage />} />
            <Route path="/equipo" element={<TeamPage />} />

            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path="/empleados/:id/usuario" element={<EmployeeLinkUserPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['ADMIN', 'HR_MANAGER']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/empresa" element={<OrganizationPage />} />
              <Route path="/tipos-documentos" element={<DocumentTypesPage />} />
              <Route element={<EmployeesSectionLayout />}>
                <Route path="/empleados" element={<EmployeesPage />} />
                <Route path="/empleados/resumen" element={<EmployeesSummaryPage />} />
                <Route path="/academicos/resumen" element={<AcademicSummaryPage />} />
                <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                  <Route path="/usuarios" element={<UsersPage />} />
                </Route>
              </Route>
              <Route path="/empleados/nuevo" element={<EmployeeCreatePage />} />
              <Route path="/empleados/:id" element={<EmployeeDetailPage />} />
              <Route path="/empleados/:id/editar" element={<EmployeeEditPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['EMPLOYEE']} />}>
              <Route path="/inicio" element={<EmployeeHomePage />} />
              <Route path="/mi-perfil" element={<MyProfilePage />} />
              <Route path="/mis-academicos" element={<MyAcademicRecordsPage />} />
              <Route path="/mis-documentos" element={<MyDocumentsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;