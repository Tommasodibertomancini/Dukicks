import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTag,
  FaArrowCircleLeft,
  FaSignOutAlt,
} from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className='admin-sidebar bg-dark text-white h-100'>
      <div className='sidebar-header text-center py-4'>
        <h5 className='m-0'>DuKicks Admin</h5>
      </div>

      <Nav className='flex-column mt-3'>
        <Nav.Item>
          <NavLink
            to='/admin/dashboard'
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FaHome className='me-2' /> Dashboard
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink
            to='/admin/products'
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FaBox className='me-2' /> Prodotti
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink
            to='/admin/orders'
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FaShoppingCart className='me-2' /> Ordini
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink
            to='/admin/users'
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FaUsers className='me-2' /> Utenti
          </NavLink>
        </Nav.Item>

        <Nav.Item>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `nav-link sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FaArrowCircleLeft className='me-2' /> Torna al sito
          </NavLink>
        </Nav.Item>

        <div className='sidebar-footer mt-auto'>
          <Nav.Item>
            <Nav.Link
              className='sidebar-link text-danger'
              onClick={handleLogout}
            >
              <FaSignOutAlt className='me-2' /> Logout
            </Nav.Link>
          </Nav.Item>
        </div>
      </Nav>
    </div>
  );
};

export default AdminSidebar;
