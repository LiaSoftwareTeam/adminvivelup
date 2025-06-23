'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/modal.css';

export default function AddEventModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    url: '',
    titulo: '',
    descripcion: '',
    fecha: '',
    tipo: 'familiar',
    limite: 0
  });
  const [loading, setLoading] = useState(false);

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
    
    try {
      // Validar que la descripción no exceda 100 caracteres
      if (formData.descripcion.length > 100) {
        alert('La descripción no debe exceder los 100 caracteres');
        setLoading(false);
        return;
      }
      
      // Preparar datos para guardar, asegurando que limite sea número y agregando registrados
      const eventData = {
        ...formData,
        limite: parseInt(formData.limite, 10),
        registrados: 0
      };
      
      await addDoc(collection(db, 'mentorshipEvents'), eventData);
      setFormData({
        url: '',
        titulo: '',
        descripcion: '',
        fecha: '',
        tipo: 'familiar',
        limite: 0
      });
      onClose();
    } catch (error) {
      console.error('Error al agregar evento:', error);
      alert('Error al agregar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Agregar Evento de Mentoría</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">URL de la imagen</label>
            <input
              type="url"
              name="url"
              className="form-input"
              value={formData.url}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Título</label>
            <input
              type="text"
              name="titulo"
              className="form-input"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción (máx. 100 caracteres)</label>
            <textarea
              name="descripcion"
              className="form-input form-textarea"
              value={formData.descripcion}
              onChange={handleChange}
              maxLength="100"
              required
            ></textarea>
            <small>{formData.descripcion.length}/100</small>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              name="fecha"
              className="form-input"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Evento</label>
            <select
              name="tipo"
              className="form-input"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="familiar">Familiar</option>
              <option value="crecimiento">Crecimiento</option>
              <option value="juvenil">Juvenil</option>
              <option value="mindmotion">Mind & Motion</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Límite de Personas (0 = ilimitado)</label>
            <input
              type="number"
              name="limite"
              className="form-input"
              value={formData.limite}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <button 
            type="submit" 
            className="form-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Evento'}
          </button>
        </form>
      </div>
    </div>
  );
}