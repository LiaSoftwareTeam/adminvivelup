'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import '../styles/topbar.css';

export default function Topbar() {
  const { currentUser, logout, userRole } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="topbar">
      <div className="search-bar">
        <input type="text" className="search-input" placeholder="Buscar..." />
      </div>
      
      <div className="user-dropdown" ref={dropdownRef}>
        <div className="user-profile" onClick={toggleDropdown}>
          <span>{currentUser?.email?.charAt(0).toUpperCase() || 'U'}</span>
        </div>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="user-email">{currentUser?.email}</div>
              <div className="user-role">
                {userRole === 'admin' ? (
                  <><FaUserShield /> Administrador</>
                ) : (
                  <><FaUser /> Usuario</>
                )}
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item logout-item" onClick={handleLogout}>
              <FaSignOutAlt className="dropdown-icon" />
              Cerrar sesión
            </div>
          </div>
        )}
      </div>
    </div>
  );
}