'use client';

import { useState } from 'react';

export default function RegistrationsTable({ registrations }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar registros según el término de búsqueda
  const filteredRegistrations = registrations.filter(reg => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      reg.nombre?.toLowerCase().includes(searchTermLower) ||
      reg.apellido?.toLowerCase().includes(searchTermLower) ||
      reg.email?.toLowerCase().includes(searchTermLower) ||
      reg.telefono?.includes(searchTerm)
    );
  });

  return (
    <div className="registrations-table-container">
      <div className="table-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="total-registrations">
          Total: {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'persona' : 'personas'}
        </div>
      </div>
      
      {filteredRegistrations.length === 0 ? (
        <div className="empty-table-message">
          {searchTerm ? 'No se encontraron registros que coincidan con la búsqueda.' : 'No hay personas registradas para este evento.'}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Edad</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map(reg => {
                // Formatear la fecha de registro
                const regDate = reg.fechaRegistro ? new Date(reg.fechaRegistro) : null;
                const formattedDate = regDate 
                  ? regDate.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) 
                  : 'N/A';
                
                return (
                  <tr key={reg.id}>
                    <td>{`${reg.nombre} ${reg.apellido}`}</td>
                    <td>{reg.email}</td>
                    <td>{reg.telefono}</td>
                    <td>{reg.edad}</td>
                    <td>{formattedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}