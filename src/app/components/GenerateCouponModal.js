'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaTicketAlt, FaPercent, FaRandom, FaCopy, FaCheck, FaCalendarAlt, FaTag, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import '../styles/modal.css';

export default function GenerateCouponModal({ isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewCoupon, setPreviewCoupon] = useState('XXXXXXXX');
  const [downloading, setDownloading] = useState(false);
  const modalRef = useRef(null);
  const couponCardRef = useRef(null);

  useEffect(() => {
    // Cargar eventos disponibles cuando se abre el modal
    if (isOpen) {
      fetchEvents();
      setSuccess(false);
      setError('');
      setGeneratedCoupon('');
      setCopied(false);
      setPreviewCoupon('XXXXXXXX');
      
      // Añadir animación de entrada
      if (modalRef.current) {
        modalRef.current.classList.add('animate-in');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // Actualizar los datos del evento seleccionado cuando cambia la selección
    if (selectedEvent && events.length > 0) {
      const eventData = events.find(event => event.id === selectedEvent);
      setSelectedEventData(eventData);
    }
  }, [selectedEvent, events]);

  // Generar un nuevo código de vista previa cuando cambia el porcentaje
  useEffect(() => {
    if (!success) {
      generatePreviewCoupon();
    }
  }, [discountPercentage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsCollection = collection(db, 'mentorshipEvents');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar eventos por fecha (más recientes primero)
      eventsList.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      setEvents(eventsList);
      if (eventsList.length > 0) {
        setSelectedEvent(eventsList[0].id);
        setSelectedEventData(eventsList[0]);
      }
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      setError('Error al cargar los eventos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCoupon = () => {
    // Generar un código de cupón aleatorio de 8 caracteres
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const generatePreviewCoupon = () => {
    const previewCode = generateRandomCoupon();
    setPreviewCoupon(previewCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validar que se haya seleccionado un evento
      if (!selectedEvent) {
        setError('Por favor, selecciona un evento.');
        setLoading(false);
        return;
      }

      // Validar que el porcentaje sea válido
      if (discountPercentage <= 0 || discountPercentage > 100) {
        setError('El porcentaje de descuento debe estar entre 1 y 100.');
        setLoading(false);
        return;
      }

      // Generar el código de cupón
      const couponCode = generateRandomCoupon();

      // Guardar el cupón en Firebase
      const couponData = {
        code: couponCode,
        eventId: selectedEvent,
        eventTitle: selectedEventData?.titulo || 'Evento',
        discountPercentage: Number(discountPercentage),
        used: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'coupons'), couponData);
      
      setGeneratedCoupon(couponCode);
      setSuccess(true);
    } catch (error) {
      console.error('Error al generar el cupón:', error);
      setError('Error al generar el cupón. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedCoupon)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
  };
  
  const handleDownloadImage = async () => {
    if (!couponCardRef.current) return;
    
    try {
      setDownloading(true);
      
      // Añadir clase temporal para mejorar la calidad de la imagen
      couponCardRef.current.classList.add('downloading');
      
      const canvas = await html2canvas(couponCardRef.current, {
        scale: 2, // Mayor escala para mejor calidad
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      // Eliminar clase temporal
      couponCardRef.current.classList.remove('downloading');
      
      // Crear enlace de descarga
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `cupon-${generatedCoupon}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al generar la imagen:', error);
    } finally {
      setDownloading(false);
    }
  };
  
  const handleClose = () => {
    // Añadir animación de salida
    if (modalRef.current) {
      modalRef.current.classList.add('animate-out');
      setTimeout(() => {
        onClose();
      }, 300); // Tiempo de la animación
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-container coupon-modal" ref={modalRef}>
        <div className="modal-header coupon-header">
          <h2><FaTicketAlt /> Generar Cupón de Descuento</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <div className="success-icon-container">
                <div className="success-icon">
                  <FaCheck />
                </div>
              </div>
              <h3>¡Cupón generado con éxito!</h3>
              
              <div className="coupon-card" ref={couponCardRef}>
                <div className="coupon-header">
                  <FaTicketAlt className="coupon-header-icon" />
                  <span>Cupón de Descuento</span>
                </div>
                
                <div className="coupon-body">
                  <div className="coupon-event-info">
                    <h4>{selectedEventData?.titulo}</h4>
                    <div className="coupon-event-details">
                      <span><FaCalendarAlt /> {selectedEventData?.fecha}</span>
                      <span><FaTag /> {selectedEventData?.tipo}</span>
                    </div>
                  </div>
                  
                  <div className="coupon-display">
                    <span className="coupon-code">{generatedCoupon}</span>
                    <button 
                      className="copy-btn" 
                      onClick={handleCopyToClipboard}
                      title="Copiar al portapapeles"
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                  
                  <div className="coupon-discount">
                    <span className="discount-value">{discountPercentage}%</span>
                    <span className="discount-label">de descuento</span>
                  </div>
                </div>
                
                <div className="coupon-footer">
                  <p>Este cupón es de un solo uso y será marcado como utilizado después de su aplicación.</p>
                </div>
              </div>
              
              <div className="coupon-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleClose}
                >
                  Cerrar
                </button>
                <button 
                  className="btn-download" 
                  onClick={handleDownloadImage}
                  disabled={downloading}
                >
                  {downloading ? 'Descargando...' : (
                    <>
                      <FaDownload /> Descargar imagen
                    </>
                  )}
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setSuccess(false);
                    setGeneratedCoupon('');
                    setCopied(false);
                  }}
                >
                  <FaRandom /> Generar otro cupón
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                
                <div className="coupon-preview">
                  <div className="preview-label">Vista previa del cupón</div>
                  <div className="preview-coupon">
                    <div className="preview-code">{previewCoupon}</div>
                    <div className="preview-discount">{discountPercentage}% OFF</div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="event">
                    <FaCalendarAlt /> Selecciona un evento:
                  </label>
                  <select 
                    id="event" 
                    value={selectedEvent} 
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    required
                    className="coupon-select"
                  >
                    {events.length === 0 ? (
                      <option value="">Cargando eventos...</option>
                    ) : (
                      events.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.titulo} - {event.fecha}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="discount">
                    <FaPercent /> Porcentaje de descuento:
                  </label>
                  <div className="range-container">
                    <input 
                      type="range" 
                      id="discount-range" 
                      min="5" 
                      max="100" 
                      step="5"
                      value={discountPercentage} 
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      className="range-input"
                    />
                    <div className="range-value">
                      <input 
                        type="number" 
                        id="discount" 
                        min="1" 
                        max="100" 
                        value={discountPercentage} 
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        required
                        className="number-input"
                      />
                      <span className="percentage-symbol">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleClose}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading || events.length === 0}
                  >
                    {loading ? 'Generando...' : (
                      <>
                        <FaRandom /> Generar Cupón
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              <div className="coupon-info">
                <h4>Información sobre los cupones</h4>
                <ul>
                  <li>Los cupones son de un solo uso.</li>
                  <li>Se aplicarán automáticamente al evento seleccionado.</li>
                  <li>El descuento se aplica sobre el precio base del evento.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}