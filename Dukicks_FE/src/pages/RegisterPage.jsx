import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser, clearError } from '../redux/slices/authSlice';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validated, setValidated] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());

    if (isAuthenticated) {
      navigate('/');
    }
  }, [dispatch, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordMismatch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...registrationData } = formData;

    try {
      await dispatch(registerUser(registrationData)).unwrap();

      toast.success('Registrazione completata con successo!', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        navigate('/login', {
          state: {
            message:
              'Registrazione completata con successo! Ora puoi accedere.',
          },
        });
      }, 1000);

      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error(
        'Si è verificato un errore durante la registrazione. Riprova.'
      );
    }
  };

  return (
    <Container className='my-5'>
      <Row className='justify-content-center'>
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className='p-4'>
              <h2 className='text-center mb-4'>Crea un account</h2>

              {error && (
                <Alert variant='danger' className='mb-4'>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3' controlId='firstName'>
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type='text'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder='Il tuo nome'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Il nome è obbligatorio.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className='mb-3' controlId='lastName'>
                      <Form.Label>Cognome</Form.Label>
                      <Form.Control
                        type='text'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder='Il tuo cognome'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Il cognome è obbligatorio.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className='mb-3' controlId='email'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder='La tua email'
                  />
                  <Form.Control.Feedback type='invalid'>
                    Inserisci un indirizzo email valido.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className='mb-3' controlId='password'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder='Crea una password'
                    isInvalid={passwordMismatch}
                  />
                  <Form.Control.Feedback type='invalid'>
                    La password deve contenere almeno 6 caratteri.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className='mb-4' controlId='confirmPassword'>
                  <Form.Label>Conferma Password</Form.Label>
                  <Form.Control
                    type='password'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder='Conferma la tua password'
                    isInvalid={passwordMismatch}
                  />
                  {passwordMismatch && (
                    <Form.Control.Feedback type='invalid'>
                      Le password non corrispondono.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <div className='d-grid'>
                  <Button variant='primary' type='submit' disabled={isLoading}>
                    {isLoading ? 'Registrazione in corso...' : 'Registrati'}
                  </Button>
                </div>
              </Form>

              <div className='text-center mt-4'>
                <p className='mb-0'>
                  Hai già un account?{' '}
                  <Link to='/login' className='link'>
                    Accedi
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
