import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSun, FaMoon } from 'react-icons/fa';
import { toggleTheme } from '../../redux/slices/uiSlice';

const ThemeToggle = ({ className }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      className={`theme-toggle btn btn-link p-0 ${className}`}
      onClick={handleToggleTheme}
      aria-label={
        theme === 'light' ? 'Passa al tema scuro' : 'Passa al tema chiaro'
      }
    >
      {theme === 'light' ? (
        <FaMoon className='text-white' size={20} />
      ) : (
        <FaSun className='text-white' size={20} />
      )}
    </button>
  );
};

export default ThemeToggle;
