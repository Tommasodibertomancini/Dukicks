import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCart } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';
import PaymentForm from '../components/checkout/PaymentForm';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import '../styles/checkout.css';

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    shippingAddress: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'creditCard',
  });

  const [validated, setValidated] = useState(false);

  const [step, setStep] = useState(1);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const [savedItems, setSavedItems] = useState([]);
  const [savedSummary, setSavedSummary] = useState({
    total: 0,
    shippingCost: 0,
    discount: 0,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const {
    items,
    summary,
    isLoading: cartLoading,
  } = useSelector((state) => state.cart);

  const {
    isLoading: orderLoading,
    error: orderError,
    currentOrder,
  } = useSelector((state) => state.orders);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    dispatch(fetchCart());

    if (user) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Italia',
      }));
    }
  }, [dispatch, isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitShippingInfo = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setSavedItems([...items]);
    setSavedSummary({
      total: summary.total,
      shippingCost: summary.shippingCost || 0,
      discount: summary.discount || 0,
    });

    setIsProcessingPayment(true);
    console.log("Step prima della creazione dell'ordine:", step);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
      }));

      const orderData = {
        ...formData,
        items: orderItems,
      };

      console.log('Creating order with data:', orderData);

      const resultAction = await dispatch(createOrder(orderData));

      if (createOrder.fulfilled.match(resultAction)) {
        console.log('Ordine creato:', resultAction.payload);

        setTimeout(() => {
          setStep(2);
          console.log('Step impostato a 2');
          window.scrollTo(0, 0);
        }, 100);
      } else {
        toast.error("Errore nella creazione dell'ordine", { autoClose: 2000 });
      }
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error("Errore nella creazione dell'ordine", { autoClose: 2000 });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSubmit = async (paymentResult) => {
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      console.log(`Using existing order ID: ${currentOrder?.id}`);
      console.log('Payment result:', paymentResult);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep(3);

      toast.success('Pagamento completato con successo!', {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate(`/thank-you?orderId=${currentOrder?.id}`);
      }, 1000);
    } catch (err) {
      console.error('Error during checkout process:', err);
      setPaymentError(
        err.message ||
          'Si è verificato un errore durante il processo di pagamento.'
      );
      toast.error('Si è verificato un errore durante il checkout. Riprova.', {
        autoClose: 2000,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const goBackToShippingInfo = () => {
    setStep(1);
  };

  if (cartLoading) {
    return (
      <Container className='my-5 text-center'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  if (step === 1 && (!items || items.length === 0)) {
    return (
      <Container className='my-5'>
        <Alert variant='info'>
          Il tuo carrello è vuoto. Aggiungi qualche prodotto prima di procedere
          al checkout.
        </Alert>
      </Container>
    );
  }
  const getDisplayItems = () => {
    if (step === 1) {
      return items;
    } else {
      return savedItems.length > 0 ? savedItems : items;
    }
  };

  const getDisplaySummary = () => {
    if (step === 1) {
      return summary;
    } else {
      return savedSummary.total > 0 ? savedSummary : summary;
    }
  };

  const displayItems = getDisplayItems();
  const displaySummary = getDisplaySummary();

  return (
    <Container className='my-5 fade-in'>
      <h1 className='mb-4'>Checkout</h1>

      <CheckoutSteps currentStep={step} />

      {orderError && (
        <Alert variant='danger' className='mb-4'>
          {orderError}
        </Alert>
      )}

      {paymentError && (
        <Alert variant='danger' className='mb-4'>
          {paymentError}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {step === 1 && (
            <Card className='mb-4 fade-in'>
              <Card.Header className='bg-white'>
                <h5 className='mb-0'>Informazioni di spedizione</h5>
              </Card.Header>
              <Card.Body>
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={handleSubmitShippingInfo}
                >
                  <Form.Group className='mb-3' controlId='shippingAddress'>
                    <Form.Label>Indirizzo</Form.Label>
                    <Form.Control
                      type='text'
                      name='shippingAddress'
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      required
                      placeholder='Via e numero civico'
                    />
                    <Form.Control.Feedback type='invalid'>
                      L'indirizzo è obbligatorio.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className='mb-3' controlId='city'>
                        <Form.Label>Città</Form.Label>
                        <Form.Control
                          type='text'
                          name='city'
                          value={formData.city}
                          onChange={handleChange}
                          required
                          placeholder='La tua città'
                        />
                        <Form.Control.Feedback type='invalid'>
                          La città è obbligatoria.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className='mb-3' controlId='postalCode'>
                        <Form.Label>CAP</Form.Label>
                        <Form.Control
                          type='text'
                          name='postalCode'
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                          placeholder='Codice postale'
                        />
                        <Form.Control.Feedback type='invalid'>
                          Il CAP è obbligatorio.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className='mb-4' controlId='country'>
                    <Form.Label>Paese</Form.Label>
                    <Form.Select
                      name='country'
                      value={formData.country}
                      onChange={handleChange}
                      required
                    >
                      <option value=''>Seleziona un paese</option>
                      <option value='Italia'>Italia</option>
                      <option value='Francia'>Francia</option>
                      <option value='Germania'>Germania</option>
                      <option value='Spagna'>Spagna</option>
                      <option value='Regno Unito'>Regno Unito</option>
                    </Form.Select>
                    <Form.Control.Feedback type='invalid'>
                      Seleziona un paese.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Card.Header className='bg-white px-0'>
                    <h5 className='mb-0'>Metodo di pagamento</h5>
                  </Card.Header>

                  <Form.Group className='my-3'>
                    <Form.Check
                      type='radio'
                      id='creditCard'
                      name='paymentMethod'
                      value='creditCard'
                      checked={formData.paymentMethod === 'creditCard'}
                      onChange={handleChange}
                      label='Carta di credito'
                    />

                    <Form.Check
                      type='radio'
                      id='paypal'
                      name='paymentMethod'
                      value='paypal'
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      label='PayPal'
                    />

                    <Form.Check
                      type='radio'
                      id='bankTransfer'
                      name='paymentMethod'
                      value='bankTransfer'
                      checked={formData.paymentMethod === 'bankTransfer'}
                      onChange={handleChange}
                      label='Bonifico bancario'
                    />
                  </Form.Group>

                  <div className='d-grid mt-4'>
                    <Button
                      variant='primary'
                      type='submit'
                      size='lg'
                      disabled={orderLoading || isProcessingPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Spinner
                            animation='border'
                            size='sm'
                            className='me-2'
                          />
                          Elaborazione...
                        </>
                      ) : (
                        'Procedi al pagamento'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {step === 2 && currentOrder && (
            <div className='fade-in'>
              <PaymentForm
                onPaymentSubmit={handlePaymentSubmit}
                paymentMethod={formData.paymentMethod}
                isLoading={isProcessingPayment}
                orderId={currentOrder.id}
                amount={displaySummary.total}
              />

              <div className='d-flex justify-content-between mt-3'>
                <Button
                  variant='outline-secondary'
                  onClick={goBackToShippingInfo}
                  disabled={isProcessingPayment}
                >
                  Torna alle informazioni di spedizione
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <Card className='mb-4 fade-in text-center'>
              <Card.Body className='py-5'>
                <div className='mb-4'>
                  <i
                    className='fas fa-check-circle text-success'
                    style={{ fontSize: '4rem' }}
                  ></i>
                </div>
                <h3 className='mb-3'>Ordine confermato!</h3>
                <p className='mb-4'>
                  Grazie per il tuo ordine. Stai per essere reindirizzato alla
                  pagina di conferma.
                </p>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Riepilogo prodotti */}
          <Card>
            <Card.Header className='bg-white'>
              <h5 className='mb-0'>Riepilogo prodotti</h5>
            </Card.Header>
            <Card.Body>
              {displayItems && displayItems.length > 0 ? (
                displayItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.sizeId}`}
                    className='d-flex justify-content-between align-items-center mb-2'
                  >
                    <div>
                      <span className='text-muted'>
                        {item.name || item.productName} -{' '}
                        {item.size || item.sizeName} ({item.quantity})
                      </span>
                    </div>
                    <span className='fw-bold'>
                      €
                      {((item.price || item.unitPrice) * item.quantity).toFixed(
                        2
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <p className='text-muted'>Nessun prodotto nel carrello</p>
              )}

              <hr />

              <div className='d-flex justify-content-between'>
                <span>Spedizione:</span>
                <span>
                  {displaySummary.shippingCost > 0
                    ? `€${displaySummary.shippingCost.toFixed(2)}`
                    : 'Gratuita'}
                </span>
              </div>

              {displaySummary.discount > 0 && (
                <div className='d-flex justify-content-between text-success'>
                  <span>Sconto:</span>
                  <span>-€{displaySummary.discount.toFixed(2)}</span>
                </div>
              )}

              <div className='d-flex justify-content-between fw-bold mt-2'>
                <span>Totale:</span>
                <span>€{displaySummary.total.toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
