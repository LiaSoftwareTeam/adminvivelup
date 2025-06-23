'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Link from 'next/link';
import EventForm from '../../../components/EventForm';
import RegistrationsTable from '../../../components/RegistrationsTable';
import RatingsChart from '../../../components/RatingsChart';
import QRGenerator from '../../../components/QRGenerator';
import { FaArrowLeft, FaInfoCircle, FaQrcode } from 'react-icons/fa';
import '../../../styles/admin.css';

export default function EventAdminPage({ params }) {
  // Asegurarse de que params.id exista y sea accesible
  const id = params?.id;
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'qr'

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        if (!id) {
          console.error('ID de evento no proporcionado');
          setError('ID de evento no proporcionado');
          setLoading(false);
          return;
        }

        console.log('Obteniendo datos para el evento con ID:', id);

        // Obtener datos del evento
        const eventDoc = await getDoc(doc(db, 'mentorshipEvents', id));
        if (!eventDoc.exists()) {
          console.error('Evento no encontrado:', id);
          setError('Evento no encontrado');
          setLoading(false);
          return;
        }

        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        console.log('Datos del evento obtenidos:', eventData);
        setEvent(eventData);

        // Obtener registros del evento
        const q = query(
          collection(db, 'registros'),
          where('eventId', '==', id)
        );
        
        const querySnapshot = await getDocs(q);
        const registrationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Registros obtenidos:', registrationsList.length);
        setRegistrations(registrationsList);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Error al cargar los datos del evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Cargando información del evento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-error">{error}</div>
        <Link href="/mentorship" className="back-link">Volver a Eventos</Link>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Administrar Evento: {event.titulo}</h1>
        <Link href="/mentorship" className="back-btn">
          <FaArrowLeft /> Volver a Eventos
        </Link>
      </div>

      <div className="admin-actions">
        <button 
          className={`action-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <FaInfoCircle /> Información y Registros
        </button>
        <button 
          className={`action-btn ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          <FaQrcode /> Generar QR
        </button>
      </div>

      {activeTab === 'info' ? (
        <div className="admin-content">
          <div className="admin-row">
            <div className="admin-col">
              <div className="admin-card">
                <h2 className="card-title">Calificaciones</h2>
                <RatingsChart eventId={id} />
              </div>
            </div>
            <div className="admin-col">
              <div className="admin-card">
                <h2 className="card-title">Información del Evento</h2>
                <EventForm event={event} eventId={id} registrations={registrations} />
              </div>
            </div>
          </div>
          
          <div className="admin-card registrations-card">
            <h2 className="card-title">Personas Registradas ({registrations.length})</h2>
            <RegistrationsTable registrations={registrations} />
          </div>
        </div>
      ) : (
        <div className="admin-content">
          <div className="admin-card qr-card">
            <h2 className="card-title">Generar Código QR para Calificaciones</h2>
            <QRGenerator eventId={id} eventTitle={event.titulo} />
          </div>
        </div>
      )}
    </div>
  );
}