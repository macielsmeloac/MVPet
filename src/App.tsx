import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { TriagePage } from './pages/TriagePage';
import { HospitalizationPage } from './pages/HospitalizationPage';
import { POSPage } from './pages/POSPage';
import { FinancialPage } from './pages/FinancialPage';
import { InventoryPage } from './pages/InventoryPage';
import { GroomingPage } from './pages/GroomingPage';
import { FiscalPage } from './pages/FiscalPage';
import { CRMPage } from './pages/CRMPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { TutorPortalPage } from './pages/TutorPortalPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { AdminPage } from './pages/AdminPage';
import { CommissionsPage } from './pages/CommissionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DonorsPage } from './pages/DonorsPage';
import { AuthPage } from './pages/AuthPage';

// Tutor Portal Pages
import { TutorAuthPage } from './pages/tutor/TutorAuthPage';
import { TutorClinicsPage } from './pages/tutor/TutorClinicsPage';
import { TutorShell } from './components/layout/TutorShell';
import { TutorDashboardPage } from './pages/tutor/TutorDashboardPage';
import { TutorMedicalRecordsPage } from './pages/tutor/TutorMedicalRecordsPage';
import { TutorPrescriptionsExamsPage } from './pages/tutor/TutorPrescriptionsExamsPage';
import { TutorVaccinesPage } from './pages/tutor/TutorVaccinesPage';
import { TutorMarketplacePage } from './pages/tutor/TutorMarketplacePage';
import { TutorAppointmentsPage } from './pages/tutor/TutorAppointmentsPage';

import { useAppStore } from './store/useAppStore';
import { useDataStore } from './store/useDataStore';
import { useSaaSStore } from './store/useSaaSStore';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const { darkMode } = useAppStore();
  const { initializeData } = useDataStore();
  const { initializeSaaSData } = useSaaSStore();
  const { session, role, loading, initialize: initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Apenas inicializa dados locais se tiver sessão (ou se quisermos manter offline temporário)
    if (session) {
      initializeData();
      initializeSaaSData();
    }
  }, [initializeData, initializeSaaSData, session]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Allow tutor routes to bypass the main clinic AuthPage if they are not logged in.
  // We handle tutor auth separately or using the same session.
  const isTutorRoute = window.location.pathname.startsWith('/tutor');

  if (!session && !isTutorRoute) {
    return <AuthPage />;
  }

  const isSuperAdmin = role === 'superadmin';

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={isSuperAdmin ? <SuperAdminPage /> : <DashboardPage />} />
          
          <Route path="/super-admin" element={isSuperAdmin ? <SuperAdminPage /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <AdminPage />} />

          <Route path="/agenda" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <AppointmentsPage />} />
          <Route path="/cadastro" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <RegistrationPage />} />
          <Route path="/prontuarios" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <MedicalRecordsPage />} />
          <Route path="/triagem" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <TriagePage />} />
          <Route path="/internacao" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <HospitalizationPage />} />
          <Route path="/banho-tosa" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <GroomingPage />} />
          <Route path="/caixa" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <POSPage />} />
          <Route path="/financeiro" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <FinancialPage />} />
          <Route path="/fiscal" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <FiscalPage />} />
          <Route path="/estoque" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <InventoryPage />} />
          <Route path="/crm" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <CRMPage />} />
          <Route path="/clube-pet" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <SubscriptionsPage />} />
          <Route path="/leva-traz" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <LogisticsPage />} />
          <Route path="/comissoes" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <CommissionsPage />} />
          <Route path="/portal-tutor" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <TutorPortalPage />} />
          <Route path="/configuracoes" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <SettingsPage />} />
          <Route path="/relatorios" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <ReportsPage />} />
          <Route path="/doadores" element={isSuperAdmin ? <Navigate to="/super-admin" replace /> : <DonorsPage />} />
        </Route>

        {/* Tutor Portal Routes */}
        <Route path="/tutor/login" element={<TutorAuthPage />} />
        <Route path="/tutor/clinicas" element={<TutorClinicsPage />} />
        <Route path="/tutor" element={<TutorShell />}>
          <Route index element={<Navigate to="painel" replace />} />
          <Route path="painel" element={<TutorDashboardPage />} />
          <Route path="prontuarios" element={<TutorMedicalRecordsPage />} />
          <Route path="exames-receitas" element={<TutorPrescriptionsExamsPage />} />
          <Route path="vacinas" element={<TutorVaccinesPage />} />
          <Route path="loja" element={<TutorMarketplacePage />} />
          <Route path="agendamento" element={<TutorAppointmentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
