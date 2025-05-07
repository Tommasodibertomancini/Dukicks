import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Spinner,
  Alert,
  Badge,
} from 'react-bootstrap';
import productService from '../services/ProductService';
import SizeSelector from '../components/products/SizeSelector';
import AddToCartButton from '../components/products/AddToCartButton';
import ProductFeatures from '../components/products/ProductFeatures';
import RatingStars from '../components/reviews/RatingStars';
import ReviewList from '../components/reviews/ReviewList';
import '../styles/productImage.css';
import SizeGuide from '../components/products/SizeGuide';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const productData = await productService.getProductById(id);
        setProduct(productData);

        if (
          productData.availableSizes &&
          productData.availableSizes.length > 0
        ) {
          const availableSize = productData.availableSizes.find(
            (size) => size.stock > 0
          );
          if (availableSize) {
            setSelectedSize(availableSize.sizeId);
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento del prodotto:', error);
        setError('Si è verificato un errore nel caricamento del prodotto.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
    return () => {
      setSelectedSize(null);
    };
  }, [id]);

  if (loading) {
    return (
      <Container className='my-5 text-center'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className='my-5'>
        <Alert variant='danger'>{error || 'Prodotto non trovato.'}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className='my-5'>
        {/* Breadcrumb */}
        <Breadcrumb className='mb-4'>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>
            Prodotti
          </Breadcrumb.Item>
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: `/products?categoryId=${product.categoryId}` }}
          >
            {product.categoryName}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          {/* Immagine del prodotto */}
          <Col md={6} className='mb-4 mb-md-0 product-image-col'>
            <div className='product-image-wrapper'>
              <img
                src={
                  product.imageUrl.startsWith('http')
                    ? product.imageUrl
                    : `https://dukicks-backend-egbkdubnbxdmg4cw.italynorth-01.azurewebsites.net${product.imageUrl}`
                }
                alt={product.name}
                className='product-main-image'
              />
            </div>
          </Col>

          {/* Dettagli prodotto */}
          <Col md={6}>
            <h1 className='mb-1'>{product.name}</h1>
            <h5 className='text-muted mb-3'>{product.brand}</h5>

            {/* Rating */}
            <div className='mb-3'>
              <RatingStars
                rating={product.averageRating}
                totalReviews={product.reviewCount}
              />
            </div>

            {/* Prezzo */}
            <div className='mb-4'>
              {product.isDiscounted ? (
                <div>
                  <span className='text-decoration-line-through text-muted me-2'>
                    €{product.price.toFixed(2)}
                  </span>
                  <span className='fs-4 fw-bold text-danger'>
                    €{product.discountPrice.toFixed(2)}
                  </span>
                  <Badge bg='danger' className='ms-2'>
                    -
                    {Math.round(
                      ((product.price - product.discountPrice) /
                        product.price) *
                        100
                    )}
                    %
                  </Badge>
                </div>
              ) : (
                <span className='fs-4 fw-bold'>
                  €{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Descrizione */}
            <div className='mb-4'>
              <p>{product.description}</p>
            </div>

            {/* Selettore taglie */}
            <div className='d-flex flex-column mb-4'>
              <SizeSelector
                sizes={product.availableSizes
                  .map((size) =>
                    typeof size === 'string' ? parseInt(size, 10) || size : size
                  )
                  .sort((a, b) => {
                    const numA = Number(a);
                    const numB = Number(b);

                    if (!isNaN(numA) && !isNaN(numB)) {
                      return numA - numB;
                    }

                    return String(a).localeCompare(String(b));
                  })}
                selectedSize={selectedSize}
                onChange={setSelectedSize}
              />
              <div className='d-flex justify-content-between align-items-center mt-1 mb-2'>
                <h6 className='mb-0 fw-bold'>Seleziona la taglia</h6>
                <SizeGuide />
              </div>
            </div>

            {/* Pulsante aggiungi al carrello */}
            <AddToCartButton
              product={product}
              selectedSize={selectedSize}
              className='mb-4'
            />

            {/* Caratteristiche prodotto */}
            <ProductFeatures features={product.features} />
          </Col>
        </Row>

        {/* Recensioni */}
        <ReviewList productId={product.id} />
      </Container>
    </>
  );
};

export default ProductDetailPage;
