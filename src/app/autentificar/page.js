'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import '../styles/auth.css';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores al cambiar los campos
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para acceder al panel administrativo</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaUser className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                required
                className="auth-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                required
                className="auth-input"
              />
            </div>
          </div>
          
          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FaSignInAlt className="button-icon" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}