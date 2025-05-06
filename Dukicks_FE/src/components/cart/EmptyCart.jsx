import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingBasket, FaArrowRight } from 'react-icons/fa';

const EmptyCart = () => {
  return (
    <Container className='my-5 cart-container'>
      <Card className='text-center py-5 empty-cart-card'>
        <Card.Body>
          <div className='mb-4'>
            <FaShoppingBasket size={60} className='empty-cart-icon' />
          </div>
          <h2 className='mb-3'>Il tuo carrello è vuoto</h2>
          <p className='text-muted mb-4'>
            Sembra che non hai ancora aggiunto nessun prodotto al carrello.
          </p>
          <Button
            as={Link}
            to='/products'
            variant='primary'
            size='lg'
            className='d-inline-flex align-items-center'
          >
            Inizia lo shopping <FaArrowRight className='ms-2' />
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmptyCart;
