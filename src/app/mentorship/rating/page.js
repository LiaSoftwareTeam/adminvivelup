'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Link from 'next/link';
import { FaSmile, FaMeh, FaSadTear, FaArrowLeft, FaPaperPlane, FaStar } from 'react-icons/fa';
import './rating.css';

export default function RatingPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!eventId) {
          setError('ID de evento no proporcionado');
          setLoading(false);
          return;
        }

        const eventDoc = await getDoc(doc(db, 'mentorshipEvents', eventId));
        if (!eventDoc.exists()) {
          setError('Evento no encontrado');
          setLoading(false);
          return;
        }

        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);
      } catch (err) {
        console.error('Error al obtener el evento:', err);
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRating) {
      setError('Por favor selecciona una calificación');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      console.log('Guardando calificación para el evento:', eventId, 'Rating:', selectedRating);
      
      // Verificar si el usuario ya ha calificado este evento
      const ratingsRef = collection(db, 'eventRatings');
      const existingRatingQuery = query(
        ratingsRef,
        where('eventId', '==', eventId)
        // En un sistema real, aquí se agregaría una condición para identificar al usuario
        // Por ejemplo: where('userId', '==', currentUser.uid)
        // Como no tenemos autenticación, usaremos localStorage en su lugar
      );
      
      // Obtener un ID único para el dispositivo/navegador
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('device_id', deviceId);
      }
      
      console.log('Device ID:', deviceId);
      
      const existingRatings = await getDocs(existingRatingQuery);
      const userRatings = existingRatings.docs.filter(doc => doc.data().deviceId === deviceId);
      
      console.log('Calificaciones existentes:', existingRatings.size, 'Calificaciones del usuario:', userRatings.length);
      
      let ratingDocRef;
      
      if (userRatings.length > 0) {
        // El usuario ya ha calificado este evento, actualizar su calificación
        const ratingDoc = userRatings[0];
        ratingDocRef = doc(db, 'eventRatings', ratingDoc.id);
        console.log('Actualizando calificación existente, ID:', ratingDoc.id);
        
        await updateDoc(ratingDocRef, {
          rating: selectedRating,
          updatedAt: new Date().toISOString()
        });
      } else {
        // El usuario no ha calificado este evento, crear una nueva calificación
        const newRatingData = {
          eventId: eventId,
          rating: selectedRating,
          deviceId: deviceId,
          createdAt: new Date().toISOString()
        };
        
        console.log('Creando nueva calificación:', newRatingData);
        const docRef = await addDoc(collection(db, 'eventRatings'), newRatingData);
        console.log('Nueva calificación creada con ID:', docRef.id);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error al enviar calificación:', err);
      setError('Error al procesar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rating-container">
        <div className="rating-loading">Cargando información del evento...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="rating-container">
        <div className="rating-error">{error}</div>
        <Link href="/mentorship" className="back-link">Volver a Eventos</Link>
      </div>
    );
  }

  return (
    <div className="rating-container">
      <div className="rating-header">
        <h1 className="rating-title">Califica el Evento</h1>
        <Link href="/mentorship" className="back-btn">
          <FaArrowLeft /> Volver a Eventos
        </Link>
      </div>

      <div className="rating-content">
        {success ? (
          <div className="rating-success">
            <h2>¡Gracias por tu calificación!</h2>
            <p>Tu opinión es muy importante para nosotros.</p>
            <Link href="/mentorship" className="back-link">Volver a Eventos</Link>
          </div>
        ) : (
          <div className="rating-card">
            <div className="event-details">
              <h2>{event.titulo}</h2>
              <p><strong>Fecha:</strong> {event.fecha}</p>
              <p><strong>Tipo:</strong> {event.tipo}</p>
            </div>

            <form className="rating-form" onSubmit={handleSubmit}>
              <h3>¿Cómo calificarías este evento?</h3>
              
              <div className="rating-options">
                <button 
                  type="button"
                  className={`rating-option good ${selectedRating === 'bueno' ? 'selected' : ''}`}
                  onClick={() => handleRatingSelect('bueno')}
                >
                  <span className="rating-icon"><FaSmile size={32} /></span>
                  <span className="rating-text">Bueno</span>
                </button>
                
                <button 
                  type="button"
                  className={`rating-option regular ${selectedRating === 'regular' ? 'selected' : ''}`}
                  onClick={() => handleRatingSelect('regular')}
                >
                  <span className="rating-icon"><FaMeh size={32} /></span>
                  <span className="rating-text">Regular</span>
                </button>
                
                <button 
                  type="button"
                  className={`rating-option bad ${selectedRating === 'malo' ? 'selected' : ''}`}
                  onClick={() => handleRatingSelect('malo')}
                >
                  <span className="rating-icon"><FaSadTear size={32} /></span>
                  <span className="rating-text">Malo</span>
                </button>
              </div>
              
              {error && <div className="rating-error-message">{error}</div>}
              
              <button 
                type="submit" 
                className="submit-rating"
                disabled={submitting || !selectedRating}
              >
                {submitting ? 'Enviando...' : (
                  <>
                    <FaPaperPlane />
                    <span>Enviar Calificación</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}