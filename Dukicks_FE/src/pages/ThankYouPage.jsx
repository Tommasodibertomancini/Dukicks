import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../redux/slices/orderSlice';
import { FaCheckCircle, FaBox, FaArrowLeft } from 'react-icons/fa';
import OrderProductsReview from '../components/reviews/OrderProductsReview';

const ThankYouPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState(null);
  const { currentOrder, isLoading, error } = useSelector(
    (state) => state.orders
  );
  const auth = useSelector((state) => state.auth);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const extractUserName = () => {
      if (!auth) return '';

      const user = auth.user || auth.currentUser;
      if (!user) return '';

      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }

      if (user.firstName) return user.firstName;
      if (user.name) return user.name;
      if (user.displayName) return user.displayName;
      if (user.username) return user.username;
      if (user.email) return user.email.split('@')[0];

      return '';
    };

    const name = extractUserName();
    setUserName(name);
  }, [auth]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('orderId');

    if (id) {
      setOrderId(id);
      dispatch(fetchOrderById(id));
    }
  }, [location, dispatch]);
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    if (typeof price === 'string') return parseFloat(price).toFixed(2);
    return price.toFixed(2);
  };

  const calculateTotal = () => {
    if (!currentOrder) return '0.00';

    if (currentOrder.total && currentOrder.total > 0) {
      return formatPrice(currentOrder.total);
    }

    if (currentOrder.TotalAmount && currentOrder.TotalAmount > 0) {
      return formatPrice(currentOrder.TotalAmount);
    }

    if (currentOrder.items && currentOrder.items.length > 0) {
      const subtotal = currentOrder.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const shippingCost = currentOrder.shippingCost || 0;
      const discount = currentOrder.discount || 0;
      return formatPrice(subtotal + shippingCost - discount);
    }

    if (currentOrder.subTotal && currentOrder.subTotal > 0) {
      return formatPrice(currentOrder.subTotal);
    }

    return '0.00';
  };

  if (isLoading) {
    return (
      <Container className='my-5 text-center thankyou-container'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='my-5 thankyou-container'>
        <Alert variant='danger'>
          Si è verificato un errore nel caricamento dei dettagli dell'ordine:{' '}
          {error}
        </Alert>
        <div className='text-center mt-4'>
          <Button as={Link} to='/' variant='primary'>
            <FaArrowLeft className='me-2' /> Torna alla home
          </Button>
        </div>
      </Container>
    );
  }

  if (!orderId) {
    return (
      <Container className='my-5 thankyou-container'>
        <Alert variant='warning'>
          Nessun ordine specificato. Potrebbe esserci un problema con il tuo
          ordine.
        </Alert>
        <div className='text-center mt-4'>
          <Button as={Link} to='/' variant='primary'>
            <FaArrowLeft className='me-2' /> Torna alla home
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className='my-5 thankyou-container'>
      <Card className='border-0 shadow thankyou-card'>
        <Card.Body className='p-md-5 text-center'>
          <div className='mb-4'>
            <FaCheckCircle
              className='text-success thankyou-success-icon'
              size={60}
            />
          </div>

          <h1 className='mb-4'>
            {userName
              ? `Grazie ${userName} per il tuo ordine!`
              : 'Grazie per il tuo ordine!'}
          </h1>
          <p className='lead mb-4'>
            Il tuo ordine #{orderId} è stato confermato.
          </p>

          <p className='text-muted mb-4'>
            Ti abbiamo inviato una conferma via email con tutti i dettagli.
            Riceverai un aggiornamento quando il tuo ordine verrà spedito.
          </p>

          {currentOrder && (
            <Card className='mb-4 mt-5 order-summary-card'>
              <Card.Header className='bg-light'>
                <h5 className='mb-0'>Riepilogo ordine</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className='border-end'>
                    <h6 className='mb-3'>Dettagli spedizione</h6>
                    <p className='mb-1'>{currentOrder.shippingAddress}</p>
                    <p className='mb-1'>
                      {currentOrder.city}, {currentOrder.postalCode}
                    </p>
                    <p className='mb-3'>{currentOrder.country}</p>

                    <h6 className='mb-3'>Metodo di pagamento</h6>
                    <p className='mb-0'>
                      {currentOrder.paymentMethod === 'creditCard' &&
                        'Carta di credito'}
                      {currentOrder.paymentMethod === 'paypal' && 'PayPal'}
                      {currentOrder.paymentMethod === 'bankTransfer' &&
                        'Bonifico bancario'}
                    </p>
                  </Col>

                  <Col md={6}>
                    <h6 className='mb-3'>Prodotti</h6>
                    {currentOrder.items &&
                      currentOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className='d-flex justify-content-between mb-2'
                        >
                          <span>
                            {item.productName} ({item.quantity})
                          </span>
                          <span>
                            €{formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}

                    <hr />

                    <div className='d-flex justify-content-between mb-2'>
                      <span>Subtotale:</span>
                      <span>
                        €
                        {currentOrder.subTotal
                          ? formatPrice(currentOrder.subTotal)
                          : formatPrice(
                              currentOrder.items?.reduce(
                                (sum, item) =>
                                  sum + item.unitPrice * item.quantity,
                                0
                              ) || 0
                            )}
                      </span>
                    </div>

                    <div className='d-flex justify-content-between mb-2'>
                      <span>Spedizione:</span>
                      <span>
                        {currentOrder.shippingCost > 0
                          ? `€${formatPrice(currentOrder.shippingCost)}`
                          : 'Gratuita'}
                      </span>
                    </div>

                    {currentOrder.discount > 0 && (
                      <div className='d-flex justify-content-between mb-2 text-success'>
                        <span>Sconto:</span>
                        <span>-€{formatPrice(currentOrder.discount)}</span>
                      </div>
                    )}

                    <div className='d-flex justify-content-between fw-bold'>
                      <span>Totale:</span>
                      <span>€{calculateTotal()}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Sezione per recensire i prodotti */}
          {currentOrder &&
            currentOrder.items &&
            currentOrder.items.length > 0 && (
              <OrderProductsReview
                orderItems={currentOrder.items}
                orderId={orderId}
              />
            )}

          <div className='mt-4 d-flex flex-column flex-md-row justify-content-center gap-3'>
            <Button as={Link} to='/' variant='primary' size='lg'>
              <FaArrowLeft className='me-2' /> Continua lo shopping
            </Button>
            <Button as={Link} to='/orders' variant='outline-primary' size='lg'>
              <FaBox className='me-2' /> I miei ordini
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ThankYouPage;
