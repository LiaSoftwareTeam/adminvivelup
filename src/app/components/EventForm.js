'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaSave, FaEdit } from 'react-icons/fa';

export default function EventForm({ event, eventId, registrations = [] }) {
  const [formData, setFormData] = useState({
    descripcion: event.descripcion || '',
    limite: event.limite || 0
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isRegistrationFull, setIsRegistrationFull] = useState(false);
  
  useEffect(() => {
    // Verificar si el registro está lleno
    if (event.limite > 0 && registrations.length >= event.limite) {
      setIsRegistrationFull(true);
    }
  }, [event.limite, registrations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limite' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    
    try {
      // Validar que la descripción no exceda 100 caracteres
      if (formData.descripcion.length > 100) {
        setError('La descripción no debe exceder los 100 caracteres');
        setLoading(false);
        return;
      }
      
      // Preparar datos para guardar (solo descripción y límite)
      const eventData = {
        descripcion: formData.descripcion,
        limite: parseInt(formData.limite, 10)
      };
      
      // Actualizar el evento en Firestore
      const eventRef = doc(db, 'mentorshipEvents', eventId);
      await updateDoc(eventRef, eventData);
      
      setSuccess(true);
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al actualizar evento:', err);
      setError('Error al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-info">
        <div className="form-info-item">
          <span className="info-label">Título:</span>
          <span className="info-value">{event.titulo}</span>
        </div>
        <div className="form-info-item">
          <span className="info-label">Fecha:</span>
          <span className="info-value">{event.fecha}</span>
        </div>
        <div className="form-info-item">
          <span className="info-label">Tipo:</span>
          <span className="info-value">{event.tipo}</span>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Descripción (máx. 100 caracteres)</label>
        <div className="input-with-icon">
          <FaEdit className="input-icon" />
          <textarea
            name="descripcion"
            className="form-input form-textarea"
            value={formData.descripcion}
            onChange={handleChange}
            maxLength="100"
            required
          ></textarea>
        </div>
        <small>{formData.descripcion.length}/100</small>
      </div>
      
      <div className="form-group">
        <label className="form-label">Límite de Personas (0 = ilimitado)</label>
        <div className="input-with-icon">
          <input
            type="number"
            name="limite"
            className="form-input"
            value={formData.limite}
            onChange={handleChange}
            min="0"
            required
            disabled={isRegistrationFull}
          />
        </div>
        {isRegistrationFull && (
          <small className="limit-warning">No se puede modificar el límite porque el evento está lleno.</small>
        )}
      </div>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">Evento actualizado correctamente</div>}
      
      <button 
        type="submit" 
        className="form-submit"
        disabled={loading}
      >
        {loading ? 'Guardando...' : (
          <>
            <FaSave />
            <span>Actualizar Evento</span>
          </>
        )}
      </button>
    </form>
  );
}