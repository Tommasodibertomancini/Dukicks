import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { FaCreditCard } from 'react-icons/fa';

const CartSummary = ({ summary, onCheckout }) => {
  return (
    <Card className='cart-summary-card'>
      <Card.Header>
        <h5 className='mb-0'>Riepilogo ordine</h5>
      </Card.Header>
      <ListGroup variant='flush'>
        <ListGroup.Item className='d-flex justify-content-between'>
          <span>Subtotale</span>
          <span>€{summary.subTotal.toFixed(2)}</span>
        </ListGroup.Item>
        <ListGroup.Item className='d-flex justify-content-between'>
          <span>Spedizione</span>
          {summary.shippingCost > 0 ? (
            <span>€{summary.shippingCost.toFixed(2)}</span>
          ) : (
            <span className='text-success free-shipping-text'>Gratuita</span>
          )}
        </ListGroup.Item>
        <ListGroup.Item className='d-flex justify-content-between fw-bold'>
          <span>Totale</span>
          <span>€{summary.total.toFixed(2)}</span>
        </ListGroup.Item>
      </ListGroup>
      <Card.Footer>
        <Button
          variant='primary'
          className='w-100 d-flex align-items-center justify-content-center'
          onClick={onCheckout}
        >
          <FaCreditCard className='me-2' /> Procedi al checkout
        </Button>
        <div className='mt-3 small text-muted text-center'>
          Spedizione gratuita per ordini superiori a €100
        </div>
      </Card.Footer>
    </Card>
  );
};

export default CartSummary;
