import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Inserisci un indirizzo email valido');
      return;
    }
    setSubscribed(true);
    setError('');
    setEmail('');
  };

  return (
    <div className='newsletter-section py-5'>
      <Container>
        <Row className='justify-content-center'>
          <Col md={8} lg={6}>
            <div className='text-center mb-4'>
              <h3>Resta aggiornato</h3>
              <p className='text-muted'>
                Iscriviti alla nostra newsletter per ricevere aggiornamenti su
                nuovi arrivi e offerte speciali
              </p>
            </div>

            {subscribed ? (
              <Alert variant='success'>
                Grazie per l'iscrizione! Ti terremo aggiornato sulle novità.
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3' controlId='newsletterEmail'>
                  <div className='input-group'>
                    <Form.Control
                      type='email'
                      placeholder='Il tuo indirizzo email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isInvalid={!!error}
                    />
                    <Button variant='primary' type='submit'>
                      Iscriviti
                    </Button>
                  </div>
                  <Form.Control.Feedback type='invalid'>
                    {error}
                  </Form.Control.Feedback>
                </Form.Group>
              </Form>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Newsletter;
