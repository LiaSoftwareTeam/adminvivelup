'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../mentorship/register/register.css';

export default function RegisterForm({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    edad: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Verificar si el evento está lleno
      if (event.limite > 0 && event.registrados >= event.limite) {
        setError('Este evento ya está lleno');
        setSubmitting(false);
        return;
      }

      // Crear el registro en la colección "registros"
      const registroData = {
        ...formData,
        eventId: eventId,
        eventoTitulo: event.titulo,
        eventoTipo: event.tipo,
        fechaRegistro: new Date().toISOString(),
        edad: parseInt(formData.edad, 10)
      };

      await addDoc(collection(db, 'registros'), registroData);

      // Actualizar el contador de registrados en el evento
      const eventRef = doc(db, 'mentorshipEvents', eventId);
      await updateDoc(eventRef, {
        registrados: (event.registrados || 0) + 1
      });

      // Actualizar el estado local del evento
      setEvent(prev => ({
        ...prev,
        registrados: (prev.registrados || 0) + 1
      }));

      setSuccess(true);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        edad: ''
      });
    } catch (err) {
      console.error('Error al registrar:', err);
      setError('Error al procesar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="register-loading">Cargando información del evento...</div>;
  }

  if (error && !event) {
    return <div className="register-error">{error}</div>;
  }

  // Verificar si el evento está lleno
  const isEventFull = event.limite > 0 && event.registrados >= event.limite;

  return (
    <div className="register-form-container">
      <div className="event-details">
        <h2>{event.titulo}</h2>
        <p><strong>Fecha:</strong> {event.fecha}</p>
        <p><strong>Tipo:</strong> {event.tipo}</p>
        <p><strong>Capacidad:</strong> {
          event.limite > 0 
            ? `${event.registrados}/${event.limite} registrados` 
            : `${event.registrados} registrados (sin límite)`
        }</p>
      </div>

      {isEventFull ? (
        <div className="event-full-message">
          <h3>Este evento está lleno</h3>
          <p>Lo sentimos, ya no hay cupos disponibles para este evento.</p>
        </div>
      ) : success ? (
        <div className="success-message">
          <h3>¡Registro exitoso!</h3>
          <p>Te has registrado correctamente para este evento.</p>
        </div>
      ) : (
        <form className="register-form" onSubmit={handleSubmit}>
          <h3>Formulario de Registro</h3>
          
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="form-input"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              name="apellido"
              className="form-input"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              className="form-input"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Edad</label>
            <input
              type="number"
              name="edad"
              className="form-input"
              value={formData.edad}
              onChange={handleChange}
              min="1"
              max="120"
              required
            />
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="form-submit"
              disabled={submitting}
            >
              {submitting ? 'Procesando...' : 'Completar Registro'}
            </button>
            <a href="/mentorship" className="cancel-btn">Cancelar</a>
          </div>
        </form>
      )}
    </div>
  );
}