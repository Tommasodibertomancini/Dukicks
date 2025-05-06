import React, { useState } from 'react';
import { Form, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FaCreditCard, FaLock, FaPaypal, FaStripe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { paymentService } from '../../services';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({
  onPaymentSubmit,
  paymentMethod,
  isLoading,
  orderId,
  amount,
}) => {
  console.log('PaymentForm riceve orderId:', orderId);
  const stripe = useStripe();
  const elements = useElements();

  const [cardData, setCardData] = useState({
    cardName: '',
  });

  const [validated, setValidated] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData({ ...cardData, [name]: value });
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!orderId) {
      setError('Non è possibile procedere al pagamento: ID ordine non valido');
      toast.error('ID ordine mancante', { autoClose: 3000 });
      return;
    }

    if (!stripe || !elements) {
      setError('Il servizio di pagamento non è disponibile al momento.');
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      const paymentIntentResponse = await paymentService.createPaymentIntent({
        orderId: orderId,
        amount: amount || 0,
        currency: 'eur',
      });

      if (!paymentIntentResponse.clientSecret) {
        throw new Error(
          "Non è stato possibile ottenere l'autorizzazione per il pagamento."
        );
      }

      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(
        paymentIntentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardData.cardName,
            },
          },
        }
      );

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      } else if (paymentResult.paymentIntent.status === 'succeeded') {
        await paymentService.updateOrderPaymentStatus({
          orderId: orderId,
          status: 'Completed',
          transactionId: paymentResult.paymentIntent.id,
        });

        toast.success('Pagamento completato con successo!', {
          autoClose: 2000,
        });

        onPaymentSubmit({
          success: true,
          transactionId: paymentResult.paymentIntent.id,
          message: 'Pagamento completato con successo',
          amount: amount,
        });
      }
    } catch (err) {
      console.error('Errore durante il pagamento:', err);
      setError(
        err.message || 'Si è verificato un errore durante il pagamento.'
      );
      toast.error(err.message || 'Pagamento fallito.', { autoClose: 2000 });
    } finally {
      setProcessingPayment(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleExternalPayment = async (provider) => {
    if (!orderId) {
      setError('Non è possibile procedere al pagamento: ID ordine non valido');
      toast.error('ID ordine mancante', { autoClose: 3000 });
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      const sessionData = {
        orderId: orderId,
        amount: amount,
        successUrl: `${window.location.origin}/thank-you?orderId=${orderId}`,
        cancelUrl: `${window.location.origin}/checkout`,
      };

      const session = await paymentService.createCheckoutSession(sessionData);

      if (session && session.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      } else {
        setError('Impossibile creare la sessione di pagamento.');
        toast.error('Impossibile avviare il pagamento.', { autoClose: 3000 });
      }
    } catch (err) {
      console.error('Errore nella creazione della sessione di pagamento:', err);
      setError(
        err.message ||
          'Si è verificato un errore nella creazione della sessione di pagamento.'
      );
      toast.error("Si è verificato un errore nell'avvio del pagamento.", {
        autoClose: 3000,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (paymentMethod !== 'creditCard') {
    return (
      <Card className='mb-4'>
        <Card.Header className='bg-white'>
          <h5 className='mb-0'>Opzioni di pagamento</h5>
        </Card.Header>
        <Card.Body className='text-center'>
          {paymentMethod === 'paypal' && (
            <div>
              <FaPaypal size={50} className='text-primary mb-3' />
              <h5>Pagamento con PayPal</h5>
              <p className='text-muted mb-4'>
                Verrai reindirizzato al sito di PayPal per completare il
                pagamento.
              </p>
              <Button
                variant='primary'
                className='px-4'
                onClick={() => handleExternalPayment('paypal')}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Spinner animation='border' size='sm' className='me-2' />
                    Attendi...
                  </>
                ) : (
                  <>Paga con PayPal</>
                )}
              </Button>
            </div>
          )}

          {paymentMethod === 'bankTransfer' && (
            <div>
              <h5>Bonifico Bancario</h5>
              <div className='bg-light p-3 rounded mb-3 text-start'>
                <p className='mb-1'>
                  <strong>Intestatario:</strong> DuKicks S.r.l.
                </p>
                <p className='mb-1'>
                  <strong>IBAN:</strong> IT12A0123456789012345678901
                </p>
                <p className='mb-1'>
                  <strong>Banca:</strong> Banca Esempio
                </p>
                <p className='mb-1'>
                  <strong>Causale:</strong> Ordine #{orderId}
                </p>
                <p className='mb-0'>
                  <strong>Importo:</strong> €{amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Alert variant='info'>
                <FaLock className='me-2' />
                L'ordine verrà elaborato dopo la ricezione del pagamento.
              </Alert>
              <Button
                variant='primary'
                onClick={() =>
                  onPaymentSubmit({ success: true, method: 'bankTransfer' })
                }
              >
                Conferma ordine con bonifico
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className='mb-4'>
      <Card.Header className='bg-white'>
        <h5 className='mb-0'>Dettagli pagamento</h5>
      </Card.Header>
      <Card.Body>
        <div className='mb-4 text-center'>
          <div className='d-flex justify-content-center mb-3'>
            <FaCreditCard size={30} className='text-primary me-2' />
            <FaLock size={20} className='text-success' />
          </div>
          <p className='text-muted small'>
            I tuoi dati di pagamento sono sicuri e criptati. Non salviamo i
            dettagli della carta.
          </p>
        </div>

        {error && (
          <Alert variant='danger' className='mb-4'>
            {error}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handlePayment}>
          <Form.Group className='mb-3' controlId='cardName'>
            <Form.Label>Titolare della carta</Form.Label>
            <Form.Control
              type='text'
              name='cardName'
              value={cardData.cardName}
              onChange={handleChange}
              required
              placeholder='Nome e cognome'
              disabled={processingPayment}
            />
            <Form.Control.Feedback type='invalid'>
              Inserisci il nome del titolare della carta.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-4'>
            <Form.Label>Dati della carta</Form.Label>
            <div className='border rounded p-3'>
              <CardElement options={cardElementOptions} />
            </div>
            <Form.Text className='text-muted mt-2'>
              Per test: usa il numero "4242 4242 4242 4242" con una data futura
              e qualsiasi CVC.
            </Form.Text>
          </Form.Group>

          <div className='d-grid mt-4'>
            <Button
              variant='primary'
              type='submit'
              size='lg'
              disabled={processingPayment || isLoading || !stripe}
              className='btn-pay'
            >
              {processingPayment ? (
                <>
                  <Spinner animation='border' size='sm' className='me-2' />
                  Elaborazione pagamento...
                </>
              ) : (
                <>Paga ora €{amount?.toFixed(2) || '0.00'}</>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PaymentForm;
