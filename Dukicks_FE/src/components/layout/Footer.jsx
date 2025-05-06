import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-dark text-white py-5 mt-5'>
      <Container>
        <Row>
          <Col md={4} className='mb-4 mb-md-0 text-center text-md-start'>
            <h5>DuKicks</h5>
            <p className='text-muted'>
              Il tuo negozio di sneakers preferito con le migliori marche e
              modelli.
            </p>
            <div className='d-flex social-icons justify-content-center justify-content-md-start'>
              <a href='#' className='me-3 text-white'>
                <FaFacebook size={24} />
              </a>
              <a href='#' className='me-3 text-white'>
                <FaTwitter size={24} />
              </a>
              <a href='#' className='me-3 text-white'>
                <FaInstagram size={24} />
              </a>
              <a href='#' className='text-white'>
                <FaYoutube size={24} />
              </a>
            </div>
          </Col>
          <Col md={2} className='mb-4 mb-md-0 text-center text-md-start'>
            <h6>Prodotti</h6>
            <ul className='list-unstyled'>
              <li className='mb-2'>
                <Link to='/products?categoryId=1' className='text-muted'>
                  Running
                </Link>
              </li>
              <li className='mb-2'>
                <Link to='/products?categoryId=2' className='text-muted'>
                  Basketball
                </Link>
              </li>
              <li className='mb-2'>
                <Link to='/products?categoryId=3' className='text-muted'>
                  Lifestyle
                </Link>
              </li>
              <li className='mb-2'>
                <Link to='/products?categoryId=4' className='text-muted'>
                  Limited Edition
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={2} className='mb-4 mb-md-0 text-center text-md-start'>
            <h6>Account</h6>
            <ul className='list-unstyled'>
              <li className='mb-2'>
                <Link to='/login' className='text-muted'>
                  Login
                </Link>
              </li>
              <li className='mb-2'>
                <Link to='/register' className='text-muted'>
                  Registrati
                </Link>
              </li>
              <li className='mb-2'>
                <Link to='/cart' className='text-muted'>
                  Carrello
                </Link>
              </li>
              <li className='mb-2'>
                <Link to='/orders' className='text-muted'>
                  Ordini
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4} className='text-center text-md-start'>
            <h6>Newsletter</h6>
            <p className='text-muted '>
              Iscriviti per ricevere aggiornamenti sulle novità e offerte
              esclusive.
            </p>
            <div className='input-group mb-3'>
              <input
                type='email'
                className='form-control'
                placeholder='Email'
                aria-label='Email'
              />
              <button className='btn btn-primary' type='button'>
                Iscriviti
              </button>
            </div>
          </Col>
        </Row>
        <hr className='my-4' />
        <Row>
          <Col className='text-center text-muted'>
            <p className='mb-0'>
              &copy; {currentYear} DuKicks. Tutti i diritti riservati.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
