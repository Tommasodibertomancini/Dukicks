import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/hero.css';

const Hero = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        const featuredData = await api.get('products/featured', { count: 2 });
        setFeaturedProducts(featuredData);
      } catch (error) {
        console.error('Errore nel recupero dei prodotti in evidenza:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleSelect = (selectedIndex) => {
    setCurrentIndex(selectedIndex);
  };

  if (loading) {
    return <div className='hero-section' style={{ minHeight: '500px' }}></div>;
  }

  return (
    <div className='hero-section mb-5'>
      <Container fluid className='px-0'>
        <Carousel
          activeIndex={currentIndex}
          onSelect={handleSelect}
          indicators={true}
          controls={true}
          interval={3000}
          className='large-image-carousel'
        >
          {/* Prima slide */}
          <Carousel.Item>
            <div className='carousel-welcome-container rounded-2'>
              <Container>
                <Row className='align-items-center carousel-content'>
                  <Col md={8} className=''>
                    <h1 className='welcome-title'>DuKicks</h1>
                    <p className='welcome-description'>
                      Le migliori sneakers per il tuo stile. Scopri la nostra
                      collezione esclusiva di sneakers delle migliori marche.
                    </p>
                    <Button
                      as={Link}
                      to='/products'
                      variant='dark'
                      size='lg'
                      className='rounded-0 welcome-button rounded-3'
                    >
                      Esplora Ora
                    </Button>
                  </Col>
                  <Col md={4} className='d-none d-sm-block'>
                    <img
                      src='https://dukicks.vercel.app/assets/img/DuKicks.png'
                      alt='DuKicks Logo'
                      className='welcome-logo-image'
                    />
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>

          {/* Slide dei prodotti */}
          {featuredProducts.map((product, idx) => (
            <Carousel.Item key={idx}>
              <div className='carousel-product-large-container rounded-2'>
                <Container>
                  <Row className='align-items-center carousel-content'>
                    <Col md={8} className='text-start'>
                      <h1 className='product-title-large'>{product.name}</h1>
                      <p className='product-description-large'>
                        {idx === 0
                          ? 'Eleganza e performance si fondono in un design unico. La nostra collezione esclusiva ridefinisce il concetto di stile urbano, combinando materiali premium e dettagli sofisticati per chi non vuole passare inosservato.'
                          : "L'innovazione incontra il comfort in un capolavoro di design. Queste sneakers rappresentano l'equilibrio perfetto tra estetica contemporanea e tecnologia all'avanguardia. Un'esperienza sensoriale che trasforma ogni passo in una dichiarazione di stile."}
                      </p>
                      <Button
                        as={Link}
                        to={`/products/${product.id}`}
                        variant='dark'
                        size='lg'
                        className='rounded-3 mt-3 action-button-large'
                      >
                        Acquista Ora
                      </Button>
                    </Col>
                    <Col md={4}>
                      <div className='product-image-large-container'>
                        <img
                          src={
                            product.imageUrl.startsWith('http')
                              ? product.imageUrl
                              : `https://dukicks-backend-egbkdubnbxdmg4cw.italynorth-01.azurewebsites.net${product.imageUrl}`
                          }
                          alt={product.name}
                          className='product-feature-image-large'
                        />
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </div>
  );
};

export default Hero;
