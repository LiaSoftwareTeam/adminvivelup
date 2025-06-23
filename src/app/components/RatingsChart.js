'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function RatingsChart({ eventId }) {
  const [ratings, setRatings] = useState({
    bueno: 0,
    regular: 0,
    malo: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        if (!eventId) {
          console.error('RatingsChart: ID de evento no proporcionado');
          setError('ID de evento no proporcionado');
          setLoading(false);
          return;
        }

        console.log('RatingsChart: Obteniendo calificaciones para el evento:', eventId);

        // Obtener calificaciones reales desde Firestore
        const ratingsQuery = query(
          collection(db, 'eventRatings'),
          where('eventId', '==', eventId)
        );
        
        const querySnapshot = await getDocs(ratingsQuery);
        console.log('RatingsChart: Calificaciones encontradas:', querySnapshot.size);
        
        // Inicializar contadores
        const ratingCounts = {
          bueno: 0,
          regular: 0,
          malo: 0
        };
        
        // Contar cada tipo de calificación
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const rating = data.rating;
          console.log('RatingsChart: Calificación encontrada:', doc.id, data);
          
          if (rating && ratingCounts.hasOwnProperty(rating)) {
            ratingCounts[rating]++;
          }
        });
        
        console.log('RatingsChart: Conteo final de calificaciones:', ratingCounts);
        
        setRatings(ratingCounts);
        setTotalRatings(ratingCounts.bueno + ratingCounts.regular + ratingCounts.malo);
      } catch (err) {
        console.error('Error al obtener calificaciones:', err);
        setError('Error al cargar las calificaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
    
    // Configurar un intervalo para actualizar las calificaciones cada 10 segundos
    const intervalId = setInterval(fetchRatings, 10000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [eventId]);

  // Calcular porcentajes para las barras
  const calculatePercentage = (value) => {
    if (totalRatings === 0) return 0;
    return (value / totalRatings) * 100;
  };

  if (loading) {
    return <div className="chart-loading">Cargando calificaciones...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  if (totalRatings === 0) {
    return <div className="chart-empty">No hay calificaciones disponibles</div>;
  }

  return (
    <div className="ratings-chart">
      <div className="chart-container">
        <div className="chart-bar-container">
          <div className="chart-label">Bueno</div>
          <div className="chart-bar-wrapper">
            <div 
              className="chart-bar good" 
              style={{ width: `${calculatePercentage(ratings.bueno)}%` }}
            ></div>
          </div>
          <div className="chart-value">{ratings.bueno}</div>
        </div>
        
        <div className="chart-bar-container">
          <div className="chart-label">Regular</div>
          <div className="chart-bar-wrapper">
            <div 
              className="chart-bar regular" 
              style={{ width: `${calculatePercentage(ratings.regular)}%` }}
            ></div>
          </div>
          <div className="chart-value">{ratings.regular}</div>
        </div>
        
        <div className="chart-bar-container">
          <div className="chart-label">Malo</div>
          <div className="chart-bar-wrapper">
            <div 
              className="chart-bar bad" 
              style={{ width: `${calculatePercentage(ratings.malo)}%` }}
            ></div>
          </div>
          <div className="chart-value">{ratings.malo}</div>
        </div>
      </div>
      
      <div className="chart-total">
        Total de calificaciones: {totalRatings}
      </div>
    </div>
  );
}