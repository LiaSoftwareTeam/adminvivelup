import '../styles/coaches.css';
import { FaTrophy, FaClock } from 'react-icons/fa';

export default function CoachCard({ coach }) {
  return (
    <div className="coach-card">
      <img src={coach.url} alt={coach.nombre} className="coach-image" />
      <div className="coach-content">
        <h3 className="coach-title">{coach.nombre}</h3>
        <div className="coach-type">
          <FaTrophy aria-label="tipo" />
          {coach.tipo}
        </div>
        <p className="coach-details">
          <strong>Edad:</strong> {coach.edad} años
        </p>
        <div className="coach-experience">
          <FaClock aria-label="experiencia" />
          {coach.experiencia} años de experiencia
        </div>
      </div>
    </div>
  );
}