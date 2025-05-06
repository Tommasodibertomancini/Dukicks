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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validated, setValidated] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());

    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [dispatch, isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('Login successful:', result);

      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        console.log('Token saved successfully, redirecting...');

        setTimeout(() => {
          navigate(from);
        }, 100);
      } else {
        console.error('Token not saved in localStorage!');
        if (result && result.token) {
          localStorage.setItem('token', result.token);
          console.log('Manual token save attempted');

          setTimeout(() => {
            navigate(from);
          }, 100);
        }
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // L'errore è già gestito nel reducer
    }
  };

  return (
    <Container className='my-5'>
      <Row className='justify-content-center'>
        <Col md={10}>
          <div className='text-center mb-5'>
            <h1 className='display-4 fw-bold'>
              <span className='text-primary'>Bentornato</span> su Dukicks
            </h1>
            <p className='lead fw-normal fs-4 mb-0'>
              Accedi al tuo account per continuare il tuo viaggio nel mondo
              delle sneakers
            </p>
          </div>

          <Row>
            <Col lg={6} className='d-none d-lg-block'>
              <div className='benefits-sidebar p-5 position-relative overflow-hidden'>
                <div className='sneaker-bg-shape'></div>

                <div className='benefit-item mb-3'>
                  <div className='icon-container mb-3'>
                    <i className='bi bi-box-seam fs-1'></i>
                  </div>
                  <h4 className='fw-bold'>Accedi alle tue collezioni</h4>
                  <p>
                    Visualizza i tuoi ordini, le tue sneakers salvate e le
                    raccolte personalizzate che hai creato nel tempo.
                  </p>
                </div>

                <div className='benefit-item'>
                  <div className='icon-container mb-3'>
                    <i className='bi bi-person-circle fs-1'></i>
                  </div>
                  <h4 className='fw-bold'>Esplora contenuti esclusivi</h4>
                  <p>
                    Sblocca offerte riservate ai membri, anteprime di nuovi
                    modelli e contenuti disponibili solo per gli utenti
                    registrati.
                  </p>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <Card className='shadow-lg border-0'>
                <Card.Body className='p-5'>
                  <h2 className='text-center mb-4'>Accedi al tuo account</h2>

                  {location.state?.message && (
                    <Alert variant='success' className='mb-4'>
                      {location.state.message}
                    </Alert>
                  )}

                  {error && (
                    <Alert variant='danger' className='mb-4'>
                      {error}
                    </Alert>
                  )}

                  <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                  >
                    <Form.Group className='mb-4' controlId='email'>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder='La tua email'
                        className='py-2'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Inserisci un indirizzo email valido.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='mb-4' controlId='password'>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type='password'
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder='La tua password'
                        className='py-2'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Inserisci la tua password.
                      </Form.Control.Feedback>
                      <div className='text-end mt-2'>
                        <Link
                          to='/forgot-password'
                          className='text-primary small'
                        >
                          Password dimenticata?
                        </Link>
                      </div>
                    </Form.Group>

                    <div className='d-grid mt-4'>
                      <Button
                        variant='primary'
                        type='submit'
                        disabled={isLoading}
                        size='lg'
                        className='py-2'
                      >
                        {isLoading ? 'Accesso in corso...' : 'Accedi'}
                      </Button>
                    </div>
                  </Form>

                  <div className='text-center mt-4'>
                    <p className='mb-0'>
                      Non hai un account?{' '}
                      <Link to='/register' className='link fw-bold text-primary'>
                        Registrati
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
