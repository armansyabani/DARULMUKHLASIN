import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { FirestoreQuotaBanner } from './components/common/FirestoreQuotaBanner';
import { GlobalPrayerWatcher } from './components/prayer/GlobalPrayerWatcher';
import { PrayerNotificationBanner } from './components/prayer/PrayerNotificationBanner';
import { UserRole } from './types';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SantriListPage } from './pages/SantriListPage';
import { SantriDetailPage } from './pages/SantriDetailPage';
import { TopUpPage } from './pages/TopUpPage';
import { TransaksiJajanPage } from './pages/TransaksiJajanPage';
import { RiwayatPage } from './pages/RiwayatPage';
import { LaporanPage } from './pages/LaporanPage';
import { StatistikPage } from './pages/StatistikPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { DeveloperFooter } from './components/common/DeveloperFooter';

const ProtectedLayout: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Memuat Koperasi Santri...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto w-full overflow-y-auto relative flex flex-col justify-between">
          <div key={location.pathname} className="w-full page-transition flex-1">
            {children}
          </div>
          <DeveloperFooter />
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedLayout>
              <DashboardPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/santri"
          element={
            <ProtectedLayout>
              <SantriListPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/santri/:id"
          element={
            <ProtectedLayout>
              <SantriDetailPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/topup"
          element={
            <ProtectedLayout allowedRoles={['admin', 'administrator']}>
              <TopUpPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/kasir"
          element={
            <ProtectedLayout allowedRoles={['admin', 'administrator']}>
              <TransaksiJajanPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/riwayat"
          element={
            <ProtectedLayout>
              <RiwayatPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedLayout allowedRoles={['admin', 'administrator']}>
              <LaporanPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/statistik"
          element={
            <ProtectedLayout allowedRoles={['admin', 'administrator']}>
              <StatistikPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/pengaturan"
          element={
            <ProtectedLayout allowedRoles={['admin', 'administrator']}>
              <SettingsPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/pengguna"
          element={
            <ProtectedLayout allowedRoles={['admin', 'administrator']}>
              <UserManagementPage />
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Prayer Watcher & Banner */}
      <GlobalPrayerWatcher />
      <PrayerNotificationBanner />

      {/* Global Toast */}
      <ToastContainer />
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
