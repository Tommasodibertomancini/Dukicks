import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import productService from '../../services/ProductService';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const products = await productService.getFeaturedProducts(8);
        setFeaturedProducts(products);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento dei prodotti');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (isLoading) {
    return (
      <div className='text-center my-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className='alert alert-danger' role='alert'>
        Si è verificato un errore: {error}
      </div>
    );
  }

  return (
    <Container className='my-5 featured-products-section'>
      <h2 className='text-center mb-4'>Prodotti in evidenza</h2>
      <Row xs={1} sm={2} md={3} lg={4} className='g-4'>
        {featuredProducts.map((product) => (
          <Col key={product.id}>
            <Card className='h-100 product-card'>
              <Card.Img
                variant='top'
                src={
                  product.imageUrl.startsWith('http')
                    ? product.imageUrl
                    : `https://dukicks-backend-egbkdubnbxdmg4cw.italynorth-01.azurewebsites.net${product.imageUrl}`
                }
                alt={product.name}
                style={{ height: '150px', objectFit: 'contain' }}
              />
              <Card.Body className='d-flex flex-column'>
                <Card.Title className='text-truncate'>
                  {product.name}
                </Card.Title>
                <Card.Subtitle className='mb-2 text-muted'>
                  {product.brand}
                </Card.Subtitle>
                <div className='mt-auto'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    {product.isDiscounted ? (
                      <>
                        <span className='text-decoration-line-through text-muted'>
                          €{product.price.toFixed(2)}
                        </span>
                        <span className='text-danger fw-bold'>
                          €{product.discountPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className='fw-bold'>
                        €{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Button
                    as={Link}
                    to={`/products/${product.id}`}
                    variant='outline-primary'
                    className='w-100'
                  >
                    Vedi dettagli
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <div className='text-center mt-4'>
        <Button as={Link} to='/products' variant='primary'>
          Vedi tutti i prodotti
        </Button>
      </div>
    </Container>
  );
};

export default FeaturedProducts;
