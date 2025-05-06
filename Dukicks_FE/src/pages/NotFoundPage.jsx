import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaShoppingBag } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <Container className='my-5'>
      <Row className='justify-content-center'>
        <Col md={8} lg={6}>
          <Card className='text-center border-0 shadow not-found-card'>
            <Card.Body className='p-5'>
              <FaExclamationTriangle
                size={60}
                className='not-found-icon mb-4'
              />

              <h1 className='display-4 mb-4 not-found-title'>404</h1>
              <h2 className='mb-4 not-found-title'>Pagina non trovata</h2>

              <p className='lead mb-5 not-found-description'>
                La pagina che stai cercando potrebbe essere stata rimossa,
                rinominata o potrebbe essere temporaneamente non disponibile.
              </p>

              <div className='d-grid gap-3 d-md-flex justify-content-md-center'>
                <Button
                  as={Link}
                  to='/'
                  variant='primary'
                  size='lg'
                  className='px-4'
                >
                  <FaHome className='me-2' /> Home
                </Button>
                <Button
                  as={Link}
                  to='/products'
                  variant='outline-primary'
                  size='lg'
                  className='px-4'
                >
                  <FaShoppingBag className='me-2' /> Prodotti
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
