'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from '../../components/RegisterForm';
import { FaArrowLeft } from 'react-icons/fa';
import './register.css';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  return (
    <div className="register-container">
      <div className="register-header">
        <h1 className="register-title">Registro para Evento</h1>
        <Link href="/mentorship" className="back-btn">
          <FaArrowLeft /> Volver a Eventos
        </Link>
      </div>

      <div className="register-content">
        {!eventId ? (
          <div className="register-error">
            <h2>Error</h2>
            <p>No se ha proporcionado un ID de evento válido.</p>
            <Link href="/mentorship" className="back-link">
              Volver a la lista de eventos
            </Link>
          </div>
        ) : (
          <RegisterForm eventId={eventId} />
        )}
      </div>
    </div>
  );
}