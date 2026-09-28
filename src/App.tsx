import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

import { PetitionsPage } from './pages/PetitionsPage';
import { PolojennyaPage } from './pages/PolojennyaPage';
import { RecomendationPage } from './pages/RecomendationPage';
import { PetitionDetailPage } from './pages/PetitionDetailPage';
import { CreatePetitionPage } from './pages/CreatePetitionPage';
import { ResetPasswordPage } from './components/ResetPasswordPage'; // 

import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

// Компонент перевірки доступу до адмінпанелі
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Публічні сторінки */}
              <Route path="/" element={<PetitionsPage />} />
              <Route path="/rules" element={<PolojennyaPage />} />
              <Route path="/recommendations" element={<RecomendationPage />} />
              <Route path="/petitions/:id" element={<PetitionDetailPage />} />
              <Route path="/create-petition" element={<CreatePetitionPage />} />

              
              <Route path="/reset-password" element={<ResetPasswordPage />} /> 

              {/* Маршрути адмінпанелі */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <AuthModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;