'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import MentorshipCard from '../components/MentorshipCard';
import AddEventModal from '../components/AddEventModal';
import { FaPlus, FaCalendarAlt } from 'react-icons/fa';
import '../styles/mentorship.css';

export default function MentorshipPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'mentorshipEvents');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isModalOpen]); // Refetch when modal closes after adding an event

  return (
    <div className="mentorship-container">
      <div className="mentorship-header">
        <h1 className="mentorship-title"><FaCalendarAlt className="title-icon" /> Eventos de Mentoría</h1>
        <button 
          className="add-event-btn" 
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus className="btn-icon" /> Agregar Evento
        </button>
      </div>

      {loading ? (
        <p>Cargando eventos...</p>
      ) : events.length === 0 ? (
        <p>No hay eventos disponibles. ¡Agrega uno nuevo!</p>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <MentorshipCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}