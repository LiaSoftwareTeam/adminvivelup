'use client';

import { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/modal.css';

export default function AddCoachModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1
    url: '',
    nombre: '',
    carrera: '',
    
    // Paso 2
    aboutMe: '',
    
    // Paso 3
    email: '',
    telefono: '',
    direccion: '',
    
    // Paso 4
    sitioWeb: '',
    linkedin: '',
    instagram: '',
    facebook: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameExists, setNameExists] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error de nombre duplicado cuando se cambia el nombre
    if (name === 'nombre') {
      setNameExists(false);
      setError('');
    }
  };

  const checkNameExists = async () => {
    if (!formData.nombre.trim()) return false;
    
    try {
      const coachesRef = collection(db, 'coaches');
      const q = query(coachesRef, where('nombre', '==', formData.nombre.trim()));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error al verificar nombre:', error);
      return false;
    }
  };

  const handleNext = async () => {
    // Validación específica para cada paso
    if (currentStep === 1) {
      if (!formData.url || !formData.nombre || !formData.carrera) {
        setError('Por favor complete todos los campos');
        return;
      }
      
      // Verificar si ya existe un coach con el mismo nombre
      const exists = await checkNameExists();
      if (exists) {
        setNameExists(true);
        setError('Ya existe un coach con este nombre, esto puede traer confusión');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.aboutMe) {
        setError('Por favor complete la descripción');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.email || !formData.telefono || !formData.direccion) {
        setError('Por favor complete todos los campos');
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingrese un email válido');
        return;
      }
    }
    
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'coaches'), formData);
      setFormData({
        url: '',
        nombre: '',
        carrera: '',
        aboutMe: '',
        email: '',
        telefono: '',
        direccion: '',
        sitioWeb: '',
        linkedin: '',
        instagram: '',
        facebook: ''
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Error al agregar coach:', error);
      setError('Error al agregar el coach');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el paso actual del formulario
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group">
              <label className="form-label">Foto de perfil (URL)</label>
              <input
                type="url"
                name="url"
                className="form-input"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/foto.jpg"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                className={`form-input ${nameExists ? 'error' : ''}`}
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              {nameExists && (
                <p className="error-message">Ya existe un coach con este nombre, esto puede traer confusión</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Carrera (tipo de coach)</label>
              <input
                type="text"
                name="carrera"
                className="form-input"
                value={formData.carrera}
                onChange={handleChange}
                placeholder="Ej: Coach de Vida, Coach Familiar, etc."
                required
              />
            </div>
          </>
        );
      case 2:
        return (
          <div className="form-group">
            <label className="form-label">About me</label>
            <textarea
              name="aboutMe"
              className="form-input form-textarea"
              value={formData.aboutMe}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>
        );
      case 3:
        return (
          <>
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
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-input"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="form-group">
              <label className="form-label">Sitio web</label>
              <input
                type="url"
                name="sitioWeb"
                className="form-input"
                value={formData.sitioWeb}
                onChange={handleChange}
                placeholder="https://ejemplo.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                className="form-input"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/usuario"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram</label>
              <input
                type="text"
                name="instagram"
                className="form-input"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@usuario"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook</label>
              <input
                type="url"
                name="facebook"
                className="form-input"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/usuario"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Agregar Coach - Paso {currentStep} de 4</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        {/* Indicador de pasos */}
        <div className="steps-indicator">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`step ${currentStep >= step ? 'active' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
        
        <form className="modal-form" onSubmit={e => e.preventDefault()}>
          {error && <p className="error-message">{error}</p>}
          
          {renderStep()}
          
          <div className="form-buttons">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="form-button prev-button"
                onClick={handlePrev}
              >
                Anterior
              </button>
            )}
            
            {currentStep < 4 ? (
              <button 
                type="button" 
                className="form-button next-button"
                onClick={handleNext}
              >
                Siguiente
              </button>
            ) : (
              <button 
                type="button" 
                className="form-button submit-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Coach'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}