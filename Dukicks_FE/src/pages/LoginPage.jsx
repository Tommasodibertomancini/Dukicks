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
        <Col md={6} lg={5}>
          <Card>
            <Card.Body className='p-4'>
              <h2 className='text-center mb-4'>Accedi</h2>

              {error && (
                <Alert variant='danger' className='mb-4'>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
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

                <Form.Group className='mb-4' controlId='password'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder='La tua password'
                  />
                  <Form.Control.Feedback type='invalid'>
                    Inserisci la tua password.
                  </Form.Control.Feedback>
                </Form.Group>

                <div className='d-grid'>
                  <Button variant='primary' type='submit' disabled={isLoading}>
                    {isLoading ? 'Accesso in corso...' : 'Accedi'}
                  </Button>
                </div>
              </Form>

              <div className='text-center mt-4'>
                <p className='mb-0'>
                  Non hai un account?{' '}
                  <Link to='/register' className='link'>
                    Registrati
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

export default LoginPage;
