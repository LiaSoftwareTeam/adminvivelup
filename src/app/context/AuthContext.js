'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Función para iniciar sesión
  const login = async (email, password) => {
    setError('');
    try {
      // Verificar si el usuario existe en la colección 'users'
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Usuario no encontrado');
        throw new Error('Usuario no encontrado');
      }
      
      const userData = querySnapshot.docs[0].data();
      
      // Verificar si la contraseña coincide
      if (userData.password !== password) {
        setError('Contraseña incorrecta');
        throw new Error('Contraseña incorrecta');
      }
      
      // Si las credenciales son correctas, establecer el usuario actual
      const user = {
        id: querySnapshot.docs[0].id,
        email: userData.email
      };
      
      setCurrentUser(user);
      setUserRole(userData.admin ? 'admin' : 'user');
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', userData.admin ? 'admin' : 'user');
      
      return user;
    } catch (error) {
      if (!error.message.includes('Usuario no encontrado') && 
          !error.message.includes('Contraseña incorrecta')) {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setCurrentUser(null);
      setUserRole(null);
      
      // Eliminar datos de localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      
      router.push('/autentificar');
    } catch (error) {
      setError('Error al cerrar sesión');
    }
  };

  // Efecto para verificar el estado de autenticación desde localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        const storedRole = localStorage.getItem('userRole');
        
        if (storedUser && storedRole) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setUserRole(storedRole);
          
          // Opcionalmente, verificar si el usuario sigue existiendo en la base de datos
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // Si el usuario ya no existe en la base de datos, cerrar sesión
            setCurrentUser(null);
            setUserRole(null);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            if (pathname !== '/autentificar') {
              router.push('/autentificar');
            }
          }
        } else if (pathname !== '/autentificar') {
          router.push('/autentificar');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, pathname]);

  // Verificar acceso a rutas protegidas
  useEffect(() => {
    if (!loading) {
      if (!currentUser && pathname !== '/autentificar') {
        router.push('/autentificar');
      }
    }
  }, [currentUser, loading, pathname, router]);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    error,
    setError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}