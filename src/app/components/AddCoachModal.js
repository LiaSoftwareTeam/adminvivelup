'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/modal.css';

export default function AddCoachModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    url: '',
    nombre: '',
    tipo: 'Familiar',
    edad: '',
    experiencia: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'coaches'), formData);
      setFormData({
        url: '',
        nombre: '',
        tipo: 'Familiar',
        edad: '',
        experiencia: ''
      });
      onClose();
    } catch (error) {
      console.error('Error al agregar coach:', error);
      alert('Error al agregar el coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Agregar Coach</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">URL de la foto</label>
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
            <label className="form-label">Tipo de Coach</label>
            <select
              name="tipo"
              className="form-input"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="Familiar">Familiar</option>
              <option value="Juvenil">Juvenil</option>
              <option value="Mind & Motion">Mind & Motion</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Edad</label>
            <input
              type="number"
              name="edad"
              className="form-input"
              value={formData.edad}
              onChange={handleChange}
              min="18"
              max="99"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Años de experiencia</label>
            <input
              type="number"
              name="experiencia"
              className="form-input"
              value={formData.experiencia}
              onChange={handleChange}
              min="0"
              max="80"
              required
            />
          </div>
          <button 
            type="submit" 
            className="form-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Coach'}
          </button>
        </form>
      </div>
    </div>
  );
}