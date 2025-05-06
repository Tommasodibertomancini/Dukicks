import React from 'react';
import { Row, Col, Breadcrumb, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaBell, FaCog } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';

const AdminHeader = ({ title, breadcrumbs = [] }) => {
  const { user, logout } = useAuth();

  return (
    <div className='admin-header mb-4'>
      <Row className='align-items-center'>
        <Col>
          <h2 className='mb-1'>{title}</h2>
          <Breadcrumb>
            <Breadcrumb.Item
              linkAs={Link}
              linkProps={{ to: '/admin/dashboard' }}
            >
              Dashboard
            </Breadcrumb.Item>

            {breadcrumbs.map((item, index) => (
              <Breadcrumb.Item
                key={index}
                active={index === breadcrumbs.length - 1}
                linkAs={index !== breadcrumbs.length - 1 ? Link : undefined}
                linkProps={
                  index !== breadcrumbs.length - 1
                    ? { to: item.path }
                    : undefined
                }
              >
                {item.label}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Col>

        <Col xs='auto' className='d-flex align-items-center'>
          <Dropdown className='me-3'>
            <Dropdown.Toggle
              variant='light'
              id='dropdown-notifications'
              className='bg-transparent border-0'
            >
              <FaBell />
            </Dropdown.Toggle>
            <Dropdown.Menu align='end'>
              <Dropdown.Item href='#/action-1'>Nuovo ordine #123</Dropdown.Item>
              <Dropdown.Item href='#/action-2'>
                Prodotto esaurito: Nike Air Max
              </Dropdown.Item>
              <Dropdown.Item href='#/action-3'>
                5 nuove recensioni
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href='#/action-4'>
                Vedi tutte le notifiche
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle
              variant='light'
              id='dropdown-user'
              className='bg-transparent border-0 d-flex align-items-center'
            >
              <div className='avatar-circle me-2 bg-primary text-white'>
                {user?.firstName?.charAt(0) || <FaUser />}
              </div>
              <span className='d-none d-md-inline'>
                {user?.firstName} {user?.lastName}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu align='end'>
              <Dropdown.Item as={Link} to='/profile'>
                <FaUser className='me-2' /> Profilo
              </Dropdown.Item>
              <Dropdown.Item as={Link} to='/admin/settings'>
                <FaCog className='me-2' /> Impostazioni
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHeader;
