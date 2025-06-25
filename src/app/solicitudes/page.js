'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaCalendarCheck, FaEye, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import '../styles/solicitudes.css';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const solicitudesCollection = collection(db, 'mentorshipRequests');
        const solicitudesSnapshot = await getDocs(solicitudesCollection);
        const solicitudesList = solicitudesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSolicitudes(solicitudesList);
      } catch (error) {
        console.error('Error al obtener solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      solicitud.nombre?.toLowerCase().includes(searchTermLower) ||
      solicitud.correo?.toLowerCase().includes(searchTermLower) ||
      solicitud.coachNombre?.toLowerCase().includes(searchTermLower) ||
      solicitud.modalidad?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleViewSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
    
    // Marcar como vista si aún no lo está
    if (!solicitud.view) {
      markAsViewed(solicitud.id);
    }
  };

  const markAsViewed = async (id) => {
    try {
      const solicitudRef = doc(db, 'mentorshipRequests', id);
      await updateDoc(solicitudRef, { view: true });
      
      // Actualizar el estado local
      setSolicitudes(prevSolicitudes => 
        prevSolicitudes.map(s => 
          s.id === id ? { ...s, view: true } : s
        )
      );
    } catch (error) {
      console.error('Error al marcar como vista:', error);
    }
  };

  const toggleAccepted = async (id, currentStatus) => {
    try {
      const solicitudRef = doc(db, 'mentorshipRequests', id);
      await updateDoc(solicitudRef, { acceptada: !currentStatus });
      
      // Actualizar el estado local
      setSolicitudes(prevSolicitudes => 
        prevSolicitudes.map(s => 
          s.id === id ? { ...s, acceptada: !s.acceptada } : s
        )
      );
    } catch (error) {
      console.error('Error al cambiar estado de aceptación:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSolicitud(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="solicitudes-container">
      <div className="solicitudes-header">
        <h1 className="solicitudes-title">
          <FaCalendarCheck className="title-icon" /> Solicitudes de Coaching
        </h1>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Cargando solicitudes...</div>
      ) : filteredSolicitudes.length === 0 ? (
        <div className="empty-message">
          {searchTerm ? 'No se encontraron solicitudes que coincidan con la búsqueda.' : 'No hay solicitudes disponibles.'}
        </div>
      ) : (
        <div className="table-container">
          <table className="solicitudes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Coach</th>
                <th>Modalidad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolicitudes.map(solicitud => (
                <tr key={solicitud.id} className={!solicitud.view ? 'unread-row' : ''}>
                  <td>{solicitud.nombre}</td>
                  <td>{solicitud.correo}</td>
                  <td>{solicitud.coachNombre}</td>
                  <td>{solicitud.modalidad}</td>
                  <td>{formatDate(solicitud.fecha)}</td>
                  <td>
                    <span className={`status-badge ${solicitud.acceptada ? 'accepted' : 'pending'}`}>
                      {solicitud.acceptada ? 'Aceptada' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewSolicitud(solicitud)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className={`action-btn ${solicitud.acceptada ? 'reject-btn' : 'accept-btn'}`} 
                        onClick={() => toggleAccepted(solicitud.id, solicitud.acceptada)}
                        title={solicitud.acceptada ? 'Marcar como pendiente' : 'Aceptar solicitud'}
                      >
                        {solicitud.acceptada ? <FaTimes /> : <FaCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedSolicitud && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Detalles de la Solicitud</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{selectedSolicitud.nombre}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correo:</span>
                <span className="detail-value">{selectedSolicitud.correo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coach:</span>
                <span className="detail-value">{selectedSolicitud.coachNombre}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Modalidad:</span>
                <span className="detail-value">{selectedSolicitud.modalidad}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha solicitada:</span>
                <span className="detail-value">{formatDate(selectedSolicitud.fecha)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de solicitud:</span>
                <span className="detail-value">{formatDate(selectedSolicitud.fechaSolicitud)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge ${selectedSolicitud.acceptada ? 'accepted' : 'pending'}`}>
                  {selectedSolicitud.acceptada ? 'Aceptada' : 'Pendiente'}
                </span>
              </div>
              <div className="modal-actions">
                <button 
                  className={`action-btn ${selectedSolicitud.acceptada ? 'reject-btn' : 'accept-btn'}`}
                  onClick={() => {
                    toggleAccepted(selectedSolicitud.id, selectedSolicitud.acceptada);
                    setSelectedSolicitud(prev => ({ ...prev, acceptada: !prev.acceptada }));
                  }}
                >
                  {selectedSolicitud.acceptada ? 'Marcar como pendiente' : 'Aceptar solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}