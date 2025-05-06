import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import categoryService from '../../services/CategoryService';

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categories = await categoryService.getCategories();
        setCategories(categories);
      } catch (error) {
        console.error('Errore nel caricamento delle categorie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Container className='my-5 category-section'>
      <h2 className='text-center mb-4'>Esplora per categoria</h2>
      <Row className='g-4'>
        {categories.map((category) => (
          <Col key={category.id} xs={12} sm={6} md={3}>
            <Link
              to={`/products?categoryId=${category.id}`}
              className='text-decoration-none'
            >
              <Card className='category-card text-center h-100'>
                <Card.Body>
                  <div className='category-icon mb-3'>
                    <i
                      className='bi bi-collection'
                      style={{ fontSize: '3rem' }}
                    ></i>
                  </div>
                  <Card.Title>{category.name}</Card.Title>
                  <Card.Text className='text-muted'>
                    {category.productCount} prodotti
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CategoryShowcase;
