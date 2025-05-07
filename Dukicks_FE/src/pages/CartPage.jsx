import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { fetchCart, updateCartItem } from '../redux/slices/cartSlice';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';
import useCart from '../hooks/useCart';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, summary, isLoading, error } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { removeItem, emptyCart } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = (cartItemId, quantity) => {
    // Qui potresti usare updateItem dal hook se preferisci
    dispatch(updateCartItem({ cartItemId, quantity }));
  };

  const handleRemoveItem = (cartItemId) => {
    removeItem(cartItemId);
  };

  const handleEmptyCart = () => {
    emptyCart();
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <Container className='my-5 cart-container'>
        <Alert variant='info d-flex justify-content-between'>
          <p className='mx-2'>
            Devi essere registrato per accedere al carrello.
          </p>
          <Link to='/login' className='btn btn-primary'>
            Accedi
          </Link>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className='my-5 text-center cart-container'>
        <div class='spinner-container'>
          <div class='newtons-cradle'>
            <div class='newtons-cradle__dot'></div>
            <div class='newtons-cradle__dot'></div>
            <div class='newtons-cradle__dot'></div>
            <div class='newtons-cradle__dot'></div>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='my-5 cart-container'>
        <Alert variant='danger'>Si è verificato un errore: {error}</Alert>
      </Container>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Container className='my-5 cart-container'>
      <h1 className='mb-4'>Il tuo carrello</h1>
      <Row>
        <Col lg={8}>
          <Card className='mb-4 cart-summary-card'>
            <Card.Header>
              <Row className='text-muted'>
                <Col md={6}>Prodotto</Col>
                <Col md={2} className='text-center'>
                  Prezzo
                </Col>
                <Col md={2} className='text-center'>
                  Quantità
                </Col>
                <Col md={2} className='text-center'>
                  Totale
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </Card.Body>
            <Card.Footer className='d-flex justify-content-between'>
              <Button
                as={Link}
                to='/products'
                variant='outline-primary'
                className='d-flex align-items-center'
              >
                <FaArrowLeft className='me-2' /> Continua lo shopping
              </Button>
              <Button
                variant='outline-danger'
                className='d-flex align-items-center'
                onClick={handleEmptyCart}
              >
                <FaTrash className='me-2' /> Svuota carrello
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={4}>
          <CartSummary summary={summary} onCheckout={handleCheckout} />
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
