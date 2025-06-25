'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/loading.css';

export default function SolicitudesLayout({ children }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/autentificar');
    }
  }, [currentUser, loading, router]);

  // No renderizar nada mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, no renderizar el contenido protegido
  if (!currentUser) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}