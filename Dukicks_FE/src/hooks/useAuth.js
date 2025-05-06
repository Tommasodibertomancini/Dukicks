/* eslint-disable no-unused-vars */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, registerUser } from '../redux/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const hasCheckedAdminRef = React.useRef({});

  const getUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        return decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ];
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return null;
  };

  const isAdmin = () => {
    return getUserRole() === 'Admin';
  };

  const login = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      navigate('/login', {
        state: {
          message: 'Registrazione completata con successo! Ora puoi accedere.',
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  };
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return false;
    }
    if (callback) callback();
    return true;
  };

  const requireAdmin = (callback) => {
    const pathname = window.location.pathname;

    if (!hasCheckedAdminRef.current[pathname]) {
      hasCheckedAdminRef.current[pathname] = true;

      if (!isAuthenticated) {
        navigate('/login', { state: { from: pathname } });
        return false;
      }

      if (!isAdmin()) {
        console.log('User is not admin, redirecting to homepage');
        navigate('/');
        return false;
      }

      if (callback) callback();
    }

    return true;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    requireAuth,
    requireAdmin,
    isAdmin,
    userRole: getUserRole(),
  };
};

export default useAuth;
