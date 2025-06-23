'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import CoachCard from '../components/CoachCard';
import AddCoachModal from '../components/AddCoachModal';
import { FaPlus, FaChalkboardTeacher } from 'react-icons/fa';
import '../styles/coaches.css';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coachesCollection = collection(db, 'coaches');
        const coachesSnapshot = await getDocs(coachesCollection);
        const coachesList = coachesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCoaches(coachesList);
      } catch (error) {
        console.error('Error al obtener coaches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, [isModalOpen]); // Refetch when modal closes after adding a coach

  return (
    <div className="coaches-container">
      <div className="coaches-header">
        <h1 className="coaches-title"><FaChalkboardTeacher className="title-icon" /> Coaches</h1>
        <button 
          className="add-coach-btn" 
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus className="btn-icon" /> Agregar Coach
        </button>
      </div>

      {loading ? (
        <p>Cargando coaches...</p>
      ) : coaches.length === 0 ? (
        <p>No hay coaches disponibles. ¡Agrega uno nuevo!</p>
      ) : (
        <div className="coaches-grid">
          {coaches.map(coach => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      )}

      <AddCoachModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}