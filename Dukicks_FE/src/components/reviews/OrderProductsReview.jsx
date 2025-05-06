import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaStar, FaRegStar, FaCheckCircle } from 'react-icons/fa';
import reviewService from '../../services/reviewService';

/**
 * Componente per recensire prodotti acquistati nella pagina Thank You
 * @param {Object} props
 * @param {Array} props.orderItems
 * @param {string} props.orderId 
 */
const OrderProductsReview = ({ orderItems, orderId }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
  });
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const checkReviewedProducts = async () => {
      if (!orderItems || orderItems.length === 0 || !orderId) return;

      try {
        const userReviews = await reviewService.getUserReviews();
        console.log("Recensioni dell'utente:", userReviews);

        if (userReviews && Array.isArray(userReviews)) {
          const alreadyReviewedIds = userReviews.map(
            (review) => review.productId
          );
          console.log(
            "Prodotti già recensiti dall'utente:",
            alreadyReviewedIds
          );

          setReviewedProducts(alreadyReviewedIds);
        }
      } catch (error) {
        console.error(
          "Errore nel recupero delle recensioni dell'utente:",
          error
        );
      }
    };

    checkReviewedProducts();
  }, [orderItems, orderId]);

  const handleOpenReviewModal = (product) => {
    console.log('Apertura modal per recensire prodotto:', product);
    setSelectedProduct(product);
    setReviewData({ rating: 0, comment: '' });
    setError(null);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const handleRatingChange = (newRating) => {
    setReviewData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleCommentChange = (e) => {
    setReviewData((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;

    if (reviewData.rating === 0) {
      setError('Seleziona una valutazione');
      return;
    }

    if (!reviewData.comment.trim()) {
      setError('Inserisci un commento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reviewPayload = {
        productId: parseInt(selectedProduct.productId, 10),
        orderId: parseInt(orderId, 10),
        rating: reviewData.rating,
        comment: reviewData.comment,
      };

      console.log('Invio recensione con payload:', reviewPayload);

      const response = await reviewService.createReview(reviewPayload);
      console.log('Risposta dal server:', response);

      setReviewedProducts([...reviewedProducts, selectedProduct.productId]);

      setSuccess('Recensione inviata con successo!');

      setTimeout(() => {
        setShowReviewModal(false);
        setSuccess(null);
      }, 1500);
    } catch (error) {
      console.error("Errore nell'invio della recensione:", error);
      setError(
        error.message ||
          "Si è verificato un errore nell'invio della recensione."
      );
    } finally {
      setLoading(false);
    }
  };

  const isProductReviewed = (productId) => {
    return reviewedProducts.includes(productId);
  };

  return (
    <Card className='my-4'>
      <Card.Header as='h5'>Recensisci i prodotti acquistati</Card.Header>
      <Card.Body>
        <p className='text-muted mb-4'>
          La tua opinione è importante! Aiuta altri acquirenti condividendo la
          tua esperienza con i prodotti che hai acquistato.
        </p>

        <Row xs={1} className='g-4'>
          {orderItems.map((item) => (
            <Col key={item.productId} className='d-flex justify-content-center'>
              <Card className='w-100 border'>
                <Card.Body className='text-center'>
                  {/* Info prodotto */}
                  <div className='mb-3'>
                    <h5 className='mb-2'>{item.name || item.productName}</h5>
                    <p className='text-muted mb-3'>
                      {item.size || item.sizeName} - Qtà: {item.quantity}
                    </p>
                  </div>

                  <div className='d-flex justify-content-center'>
                    {isProductReviewed(item.productId) ? (
                      <Button
                        variant='success'
                        disabled
                        style={{ width: '200px' }}
                      >
                        <FaCheckCircle className='me-2' /> Recensito
                      </Button>
                    ) : (
                      <Button
                        variant='success'
                        style={{ width: '200px' }}
                        onClick={() => handleOpenReviewModal(item)}
                        className='fw-bold'
                      >
                        Recensisci
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>

      {/* Modal per la recensione */}
      <Modal show={showReviewModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Recensisci {selectedProduct?.name || selectedProduct?.productName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant='danger'>{error}</Alert>}
          {success && <Alert variant='success'>{success}</Alert>}

          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Valutazione</Form.Label>
              <div className='d-flex mb-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                  >
                    {reviewData.rating >= star ? (
                      <FaStar className='text-warning' size={24} />
                    ) : (
                      <FaRegStar className='text-warning' size={24} />
                    )}
                  </span>
                ))}
              </div>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Commento</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                value={reviewData.comment}
                onChange={handleCommentChange}
                placeholder='Condividi la tua esperienza con questo prodotto...'
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            Annulla
          </Button>
          <Button
            variant='primary'
            onClick={handleSubmitReview}
            disabled={loading || success}
          >
            {loading ? 'Invio...' : 'Invia recensione'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default OrderProductsReview;
