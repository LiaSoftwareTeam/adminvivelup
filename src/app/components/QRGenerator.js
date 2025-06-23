'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaCopy, FaQrcode } from 'react-icons/fa';

export default function QRGenerator({ eventId, eventTitle }) {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingUrl, setRatingUrl] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Crear la URL para calificar el evento
        const baseUrl = window.location.origin;
        const ratingPageUrl = `${baseUrl}/mentorship/rating?eventId=${eventId}`;
        setRatingUrl(ratingPageUrl);
        
        // Generar QR usando la API de QR Code Generator
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ratingPageUrl)}`;
        setQrUrl(qrApiUrl);
      } catch (err) {
        console.error('Error al generar QR:', err);
        setError('Error al generar el código QR');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [eventId]);

  const handleDownload = () => {
    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-evento-${eventId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="qr-loading">Generando código QR...</div>;
  }

  if (error) {
    return <div className="qr-error">{error}</div>;
  }

  return (
    <div className="qr-generator">
      <div className="qr-info">
        <p>Este código QR dirige a los participantes a una página donde pueden calificar el evento como "Bueno", "Regular" o "Malo".</p>
        <p>Comparte este código con los participantes al finalizar el evento.</p>
      </div>
      
      <div className="qr-content">
        <div className="qr-image-container">
          <img src={qrUrl} alt="Código QR para calificar el evento" className="qr-image" />
          <h3 className="qr-title">Califica el evento: {eventTitle}</h3>
        </div>
        
        <div className="qr-actions">
          <button className="qr-download-btn" onClick={handleDownload}>
            <FaDownload /> Descargar QR
          </button>
          
          <div className="qr-url-container">
            <p className="qr-url-label">URL para calificar:</p>
            <div className="qr-url">
              <input 
                type="text" 
                value={ratingUrl} 
                readOnly 
                className="qr-url-input" 
              />
              <button 
                className="qr-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(ratingUrl);
                  alert('URL copiada al portapapeles');
                }}
              >
                <FaCopy /> Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}