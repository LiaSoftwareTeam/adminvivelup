'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/modal.css';

export default function RegistrationsModal({ isOpen, onClose, eventId, eventTitle }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!isOpen || !eventId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const q = query(
          collection(db, 'registros'),
          where('eventId', '==', eventId)
        );
        
        const querySnapshot = await getDocs(q);
        const registrationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRegistrations(registrationsList);
      } catch (err) {
        console.error('Error al obtener registros:', err);
        setError('Error al cargar los registros');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [isOpen, eventId]);

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal registrations-modal">
        <div className="modal-header">
          <h2 className="modal-title">Registros para: {eventTitle}</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <p className="loading-message">Cargando registros...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : registrations.length === 0 ? (
            <p className="empty-message">No hay personas registradas para este evento.</p>
          ) : (
            <div className="registrations-list">
              <div className="registrations-header">
                <div className="reg-col">Nombre</div>
                <div className="reg-col">Email</div>
                <div className="reg-col">Teléfono</div>
                <div className="reg-col">Edad</div>
                <div className="reg-col">Fecha de Registro</div>
              </div>
              
              {registrations.map(reg => {
                // Formatear la fecha de registro
                const regDate = reg.fechaRegistro ? new Date(reg.fechaRegistro) : null;
                const formattedDate = regDate 
                  ? regDate.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) 
                  : 'N/A';
                
                return (
                  <div key={reg.id} className="registration-item">
                    <div className="reg-col">{`${reg.nombre} ${reg.apellido}`}</div>
                    <div className="reg-col">{reg.email}</div>
                    <div className="reg-col">{reg.telefono}</div>
                    <div className="reg-col">{reg.edad}</div>
                    <div className="reg-col">{formattedDate}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}