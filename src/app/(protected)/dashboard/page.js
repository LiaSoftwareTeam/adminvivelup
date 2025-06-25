import { FaHome } from 'react-icons/fa';

export default function Dashboard() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 110px)',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        color: 'var(--text-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <FaHome /> Bienvenido al Dashboard
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Selecciona una opción del menú lateral</p>
    </div>
  );
}