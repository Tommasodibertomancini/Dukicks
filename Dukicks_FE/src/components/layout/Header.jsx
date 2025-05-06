import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Navbar,
  Nav,
  Container,
  Badge,
  NavDropdown,
  Form,
} from 'react-bootstrap';
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaClipboardList,
  FaSearch,
  FaUserCog,
} from 'react-icons/fa';
import ThemeToggle from '../common/ThemeToggle';
import LogoutButton from '../auth/LogoutButton';
import '../../styles/header.css';
import useAuth from '../../hooks/useAuth';

const Header = () => {
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const cartItemsCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header>
      <Navbar bg='dark' variant='dark' expand='lg' sticky='top'>
        <Container fluid>
          <Navbar.Brand as={Link} to='/'>
            <img
              src='../../public/assets/img/DuKicks.png'
              alt='DuKicks Logo'
              width='50'
              height='50'
              className='d-inline-block m-2'
            />
            DuKicks
          </Navbar.Brand>

          {/* Toggle per dispositivi mobili */}
          <Navbar.Toggle aria-controls='basic-navbar-nav' />

          <Navbar.Collapse id='basic-navbar-nav'>
            {/* Menu di navigazione sinistra */}
            <Nav className='me-auto'>
              <Nav.Link as={Link} to='/'>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to='/products'>
                Prodotti
              </Nav.Link>
              <Nav.Link as={Link} to={'/products?categoryId=4'}>              
              Limited Edition 
              </Nav.Link>
              {isAuthenticated && isAdmin() && (
                <Nav.Link as={Link} to='/admin/dashboard'>
                  Admin
                </Nav.Link>
              )}
            </Nav>

            {/* Searchbar al centro */}
            <div className='search-container mx-auto'>
              <Form onSubmit={handleSearch} className='search-form'>
                <input
                  type='text'
                  placeholder='Cerca prodotti...'
                  className='search-input'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type='submit' className='search-button'>
                  <FaSearch />
                </button>
              </Form>
            </div>

            {/* Icone e menu utente a destra */}
            <Nav className='align-items-center'>
              <ThemeToggle className='me-3' />

              <Nav.Link as={Link} to='/cart' className='position-relative me-2'>
                <FaShoppingCart />
                {cartItemsCount > 0 && (
                  <Badge
                    pill
                    bg='danger'
                    className='position-absolute top-0 start-100 translate-middle'
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Nav.Link>

              <Nav.Link as={Link} to='/wishlist' className='me-2'>
                <FaHeart />
              </Nav.Link>

              {isAuthenticated ? (
                <NavDropdown
                  title={
                    <span>
                      <FaUser className='me-1' />
                    </span>
                  }
                  id='user-dropdown'
                  align='end'
                  className='user-dropdown'
                >
                  <NavDropdown.Item as={Link} to='/profile'>
                    <FaUser className='me-2' />
                    Il mio profilo
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/orders'>
                    <FaClipboardList className='me-2' />I miei ordini
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/wishlist'>
                    <FaHeart className='me-2' />
                    Wishlist
                  </NavDropdown.Item>
                  {isAdmin() && (
                    <NavDropdown.Item as={Link} to='/admin/dashboard'>
                      <FaUserCog className='me-2' />
                      Dashboard Admin
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item as='div'>
                    <LogoutButton
                      variant='link'
                      className='p-0 text-danger w-100 text-start'
                      showIcon={true}
                    />
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to='/login'>
                  <FaUser className='me-1' /> 
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
