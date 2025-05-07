import React from 'react';
import { Row, Col, Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  return (
    <Row className='py-3 border-bottom align-items-center cart-item-row'>
      <Col md={6} className='d-flex align-items-center mb-3 mb-md-0'>
        <div className='me-3 cart-item-image'>
          <Link to={`/products/${item.productId}`}>
            <Image
              src={
                item.imageUrl.startsWith('http')
                  ? item.imageUrl
                  : `https://dukicks-backend-egbkdubnbxdmg4cw.italynorth-01.azurewebsites.net${item.imageUrl}`
              }
              alt={item.productName}
              width={100}
              height={80}
              className='object-fit-contain rounded'
            />
          </Link>
        </div>
        <div>
          <Link
            to={`/products/${item.productId}`}
            className='text-decoration-none'
          >
            <h5 className='mb-1'>{item.productName}</h5>
          </Link>
          <p className='text-muted mb-1'>Brand: {item.brand}</p>
          {item.sizeName && (
            <p className='text-muted mb-0'>Taglia: {item.sizeName}</p>
          )}
        </div>
      </Col>

      <Col md={2} className='text-center mb-3 mb-md-0'>
        <span className='fw-bold'>€{item.unitPrice.toFixed(2)}</span>
      </Col>

      <Col md={2} className='text-center mb-3 mb-md-0'>
        <Form.Control
          type='number'
          min='1'
          value={item.quantity}
          onChange={handleQuantityChange}
          className='mx-auto text-center'
          style={{ width: '70px' }}
        />
      </Col>

      <Col
        md={2}
        className='text-center d-flex justify-content-center align-items-center'
      >
        <span className='me-3 fw-bold'>€{item.subTotal.toFixed(2)}</span>
        <Button
          variant='link'
          className='text-danger p-0'
          onClick={() => onRemove(item.id)}
        >
          <FaTrash />
        </Button>
      </Col>
    </Row>
  );
};

export default CartItem;
