'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegistrationsModal from './RegistrationsModal';
import '../styles/mentorship.css';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';

export default function MentorshipCard({ event }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Determinar si el evento está lleno
  const isEventFull = event.limite > 0 && event.registrados >= event.limite;
  
  // Formatear la información de capacidad
  const capacityText = event.limite > 0 
    ? `${event.registrados}/${event.limite} registrados` 
    : `${event.registrados} registrados (sin límite)`;
  
  return (
    <>
      <div className="event-card">
        <img src={event.url} alt={event.titulo} className="event-image" />
        <div className="event-content">
          <h3 className="event-title">{event.titulo}</h3>
          <p className="event-description">
            {event.descripcion.length > 100 
              ? `${event.descripcion.substring(0, 100)}...` 
              : event.descripcion}
          </p>
          <div className="event-info">
            <div className="event-date">
              <FaCalendarAlt aria-label="calendar" />
              {event.fecha}
            </div>
            <div className="event-type">
              <FaTag aria-label="type" />
              {event.tipo}
            </div>
          </div>
          <div className="event-capacity">
            {capacityText}
          </div>
          <div className="event-buttons">
            <Link 
              href={`/mentorship/register?eventId=${event.id}`}
              className={`register-btn ${isEventFull ? 'disabled' : ''}`}
              aria-disabled={isEventFull}
              onClick={(e) => isEventFull && e.preventDefault()}
            >
              {isEventFull ? 'Evento Lleno' : 'Registrarse'}
            </Link>
            <button 
              className="view-registrations-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Ver Registros
            </button>
          </div>
          <Link 
            href={`/mentorship/admin/${event.id}`}
            className="admin-btn"
          >
            Administrar
          </Link>
        </div>
      </div>
      
      {/* Modal renderizado fuera de la tarjeta para evitar problemas de visualización */}
      <RegistrationsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        eventId={event.id}
        eventTitle={event.titulo}
      />
    </>
  );
}