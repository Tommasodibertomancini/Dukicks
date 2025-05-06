import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import { FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LogoutButton = ({
  variant = 'outline-danger',
  className = '',
  showIcon = true,
  size = null,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      dispatch(logoutUser());
      toast.success('Logout effettuato con successo');

      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
      toast.error('Si è verificato un errore durante il logout');
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleLogout}
      size={size}
    >
      {showIcon && <FaSignOutAlt className='me-2' />}
      Logout
    </Button>
  );
};

export default LogoutButton;
