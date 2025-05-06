import React, { useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoading, error } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveItem = (wishlistItemId) => {
    dispatch(removeFromWishlist(wishlistItemId));
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
  };

  const handleAddToCart = (productId, sizeId = null) => {
    if (sizeId) {
      dispatch(addToCart({ productId, sizeId, quantity: 1 }));
    } else {
      navigate(`/products/${productId}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className='my-5 wishlist-container'>
        <Alert variant='info d-flex justify-content-between'>
          <p className='mx-2'>
            Devi essere registrato per accedere ai tuoi preferiti.
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
      <Container className='my-5 text-center wishlist-container'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='my-5 wishlist-container'>
        <Alert variant='danger'>Si è verificato un errore: {error}</Alert>
      </Container>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Container className='my-5 wishlist-container'>
        <Card className='text-center py-5 wishlist-card'>
          <Card.Body>
            <div className='mb-4'>
              <FaTrash size={60} className='wishlist-empty-icon' />
            </div>
            <h2 className='mb-3'>La tua lista dei preferiti è vuota</h2>
            <p className='text-muted mb-4'>
              Non hai ancora aggiunto nessun prodotto ai preferiti.
            </p>
            <Button as={Link} to='/products' variant='primary' size='lg'>
              <FaArrowLeft className='me-2' /> Esplora i prodotti
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className='my-5 wishlist-container'>
      <h1 className='mb-4'>I tuoi preferiti</h1>

      <Row>
        <Col lg={12}>
          <Card className='mb-4 wishlist-card'>
            <Card.Header className='d-flex justify-content-between align-items-center'>
              <h5 className='mb-0'>
                Hai {items.length} prodotti nella tua lista dei preferiti
              </h5>
              <Button
                variant='outline-danger'
                size='sm'
                onClick={handleClearWishlist}
                disabled={items.length === 0}
              >
                <FaTrash className='me-2' /> Svuota lista
              </Button>
            </Card.Header>
            <Card.Body>
              <Row xs={1} md={2} lg={3} xl={4} className='g-4'>
                {items.map((item) => (
                  <Col key={item.id}>
                    <Card className='h-100 product-card wishlist-item'>
                      <div className='position-relative'>
                        <Link to={`/products/${item.productId}`}>
                          <Card.Img
                            variant='top'
                            src={
                              item.imageUrl.startsWith('http')
                                ? item.imageUrl
                                : `https://localhost:7025${item.imageUrl}`
                            }
                            alt={item.productName}
                            style={{ height: '200px', objectFit: 'contain' }}
                          />
                        </Link>
                        <Button
                          variant='danger'
                          size='sm'
                          className='position-absolute top-0 end-0 m-2'
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                      <Card.Body className='d-flex flex-column'>
                        <Card.Title>{item.productName}</Card.Title>
                        <Card.Subtitle className='mb-2'>
                          {item.brand}
                        </Card.Subtitle>
                        <div className='mt-auto'>
                          <div className='d-flex justify-content-between align-items-center mb-2'>
                            {item.isDiscounted ? (
                              <>
                                <span className='text-decoration-line-through text-muted'>
                                  €{item.price?.toFixed(2)}
                                </span>
                                <span className='fw-bold text-danger'>
                                  €{item.discountPrice?.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className='fw-bold'>
                                €{item.price?.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button
                            variant='primary'
                            className='w-100'
                            onClick={() => handleAddToCart(item.productId)}
                          >
                            <FaShoppingCart className='me-2' /> Aggiungi al
                            carrello
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
            <Card.Footer>
              <Button as={Link} to='/products' variant='outline-primary'>
                <FaArrowLeft className='me-2' /> Continua lo shopping
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WishlistPage;
