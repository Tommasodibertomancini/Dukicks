import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Tabs,
  Tab,
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaKey, FaClipboardList, FaStar } from 'react-icons/fa';
import LogoutButton from '../components/auth/LogoutButton';
import UserReviews from '../components/reviews/UserReviews';
import { authService } from '../services';
import { checkAuthStatus } from '../redux/slices/authSlice';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    console.log('Stato di autenticazione:', isAuthenticated);
    console.log('Dati utente disponibili:', user);

    if (isAuthenticated && !user) {
      console.log(
        'Utente autenticato ma dati mancanti, recupero informazioni...'
      );

      const fetchProfileData = async () => {
        try {
          const profileResponse = await authService.getProfile();
          console.log('Dati profilo recuperati:', profileResponse);

          if (profileResponse && profileResponse.data) {
            const userData = profileResponse.data;

            setProfileData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
              postalCode: userData.postalCode || '',
              country: userData.country || 'Italia',
            });
          }
        } catch (error) {
          console.error('Errore nel recupero dati profilo:', error);
        }
      };

      fetchProfileData();
    } else if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Italia',
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing && user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Italia',
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await authService.updateProfile(profileData);

      setSuccess('Profilo aggiornato con successo!');
      setIsEditing(false);

      dispatch(checkAuthStatus());
    } catch (err) {
      console.error('Errore aggiornamento profilo:', err);
      setError(
        err.message ||
          "Si è verificato un errore durante l'aggiornamento del profilo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le password non corrispondono.');
      setIsLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordData);
      setSuccess('Password cambiata con successo!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(
        err.message || 'Si è verificato un errore durante il cambio password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className='my-5 profile-container'>
      <Row>
        <Col lg={3} md={4} className='mb-4'>
          <Card className='profile-sidebar'>
            <Card.Body>
              <div className='text-center mb-4'>
                <div
                  className='avatar-placeholder rounded-circle d-flex align-items-center justify-content-center mx-auto'
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {profileData.firstName ? (
                    profileData.firstName.charAt(0).toUpperCase()
                  ) : (
                    <FaUser />
                  )}
                </div>
                <h5 className='mt-3'>
                  {profileData.firstName} {profileData.lastName}
                </h5>
                <p className='text-muted'>{profileData.email}</p>
              </div>

              <div className='d-grid gap-2'>
                <Button
                  variant='outline-primary'
                  className={`profile-nav-button ${
                    activeTab === 'profile' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FaUser className='me-2' /> Profilo
                </Button>
                <Button
                  variant='outline-primary'
                  className={`profile-nav-button ${
                    activeTab === 'password' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('password')}
                >
                  <FaKey className='me-2' /> Cambio Password
                </Button>
                <Button
                  variant='outline-primary'
                  className={`profile-nav-button ${
                    activeTab === 'orders' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  <FaClipboardList className='me-2' /> I miei ordini
                </Button>
                <Button
                  variant='outline-primary'
                  className={`profile-nav-button ${
                    activeTab === 'reviews' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <FaStar className='me-2' /> Le mie recensioni
                </Button>
                <div className='mt-2'>
                  <LogoutButton className='w-100' />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} md={8}>
          <Card className='profile-content'>
            <Card.Body>
              <Tabs
                id='profile-tabs'
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className='mb-4 profile-tabs'
              >
                <Tab eventKey='profile' title='Profilo'>
                  <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h4 className='mb-0'>Informazioni personali</h4>
                    <Button
                      variant={
                        isEditing ? 'outline-secondary' : 'outline-primary'
                      }
                      size='sm'
                      onClick={handleEditToggle}
                    >
                      {isEditing ? (
                        'Annulla'
                      ) : (
                        <>
                          <FaEdit className='me-1' /> Modifica
                        </>
                      )}
                    </Button>
                  </div>

                  {error && <Alert variant='danger'>{error}</Alert>}
                  {success && <Alert variant='success'>{success}</Alert>}

                  <Form onSubmit={handleProfileSubmit}>
                    <Row className='mb-3'>
                      <Col md={6}>
                        <Form.Group controlId='firstName'>
                          <Form.Label>Nome</Form.Label>
                          <Form.Control
                            type='text'
                            name='firstName'
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId='lastName'>
                          <Form.Label>Cognome</Form.Label>
                          <Form.Control
                            type='text'
                            name='lastName'
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className='mb-3'>
                      <Col md={6}>
                        <Form.Group controlId='email'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type='email'
                            name='email'
                            value={profileData.email}
                            onChange={handleProfileChange}
                            disabled={true}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId='phone'>
                          <Form.Label>Telefono</Form.Label>
                          <Form.Control
                            type='tel'
                            name='phone'
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className='mt-4 mb-3'>Indirizzo di spedizione</h5>

                    <Form.Group className='mb-3' controlId='address'>
                      <Form.Label>Indirizzo</Form.Label>
                      <Form.Control
                        type='text'
                        name='address'
                        value={profileData.address}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>

                    <Row className='mb-3'>
                      <Col md={6}>
                        <Form.Group controlId='city'>
                          <Form.Label>Città</Form.Label>
                          <Form.Control
                            type='text'
                            name='city'
                            value={profileData.city}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId='postalCode'>
                          <Form.Label>CAP</Form.Label>
                          <Form.Control
                            type='text'
                            name='postalCode'
                            value={profileData.postalCode}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className='mb-3' controlId='country'>
                      <Form.Label>Paese</Form.Label>
                      <Form.Select
                        name='country'
                        value={profileData.country}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      >
                        <option value='Italia'>Italia</option>
                        <option value='Francia'>Francia</option>
                        <option value='Germania'>Germania</option>
                        <option value='Spagna'>Spagna</option>
                        <option value='Regno Unito'>Regno Unito</option>
                      </Form.Select>
                    </Form.Group>

                    {isEditing && (
                      <div className='d-grid mt-4'>
                        <Button
                          type='submit'
                          variant='primary'
                          disabled={isLoading}
                        >
                          {isLoading ? 'Salvataggio...' : 'Salva modifiche'}
                        </Button>
                      </div>
                    )}
                  </Form>
                </Tab>

                <Tab eventKey='password' title='Cambio Password'>
                  <h4 className='mb-4'>Cambio Password</h4>

                  {error && <Alert variant='danger'>{error}</Alert>}
                  {success && <Alert variant='success'>{success}</Alert>}

                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className='mb-3' controlId='currentPassword'>
                      <Form.Label>Password attuale</Form.Label>
                      <Form.Control
                        type='password'
                        name='currentPassword'
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className='mb-3' controlId='newPassword'>
                      <Form.Label>Nuova password</Form.Label>
                      <Form.Control
                        type='password'
                        name='newPassword'
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                      <Form.Text className='text-muted'>
                        La password deve essere di almeno 6 caratteri.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className='mb-4' controlId='confirmPassword'>
                      <Form.Label>Conferma nuova password</Form.Label>
                      <Form.Control
                        type='password'
                        name='confirmPassword'
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>

                    <div className='d-grid'>
                      <Button
                        type='submit'
                        variant='primary'
                        disabled={isLoading}
                      >
                        {isLoading ? 'Aggiornamento...' : 'Aggiorna password'}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey='orders' title='I miei ordini'>
                  <h4 className='mb-4'>Storico ordini</h4>

                  <Alert variant='info'>
                    Vai alla pagina <strong>I miei ordini</strong> per
                    visualizzare lo storico completo dei tuoi acquisti.
                  </Alert>

                  <div className='text-center mt-3'>
                    <Button
                      variant='primary'
                      onClick={() => navigate('/orders')}
                    >
                      <FaClipboardList className='me-2' /> Visualizza tutti gli
                      ordini
                    </Button>
                  </div>
                </Tab>

                <Tab eventKey='reviews' title='Le mie recensioni'>
                  <UserReviews />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
