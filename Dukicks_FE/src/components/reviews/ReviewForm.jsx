import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaStar, FaRegStar } from 'react-icons/fa';
import reviewService from '../../services/ReviewService';

const ReviewForm = ({ productId, orderId, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Seleziona una valutazione');
      return;
    }

    if (!comment.trim()) {
      setError('Inserisci un commento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderIdNumeric = parseInt(orderId, 10);

      const productIdNumeric = parseInt(productId, 10);

      const reviewData = {
        productId: productIdNumeric,
        orderId: orderIdNumeric,
        order_id: orderIdNumeric,
        orderID: orderIdNumeric,
        rating,
        comment,
      };

      const response = await reviewService.createReview(reviewData);

      onReviewSubmitted(response);
    } catch (error) {
      console.error("Errore nell'invio della recensione:", error);

      // Proviamo a visualizzare più dettagli sull'errore
      if (error.response) {
        console.error('Dettagli errore dal server:', error.response);
      }

      setError(
        error.message ||
          "Si è verificato un errore nell'invio della recensione."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='review-form'>
      <h5 className='mb-3'>Scrivi una recensione</h5>

      {error && <Alert variant='danger'>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Valutazione</Form.Label>
          <div className='d-flex mb-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className='cursor-pointer me-1'
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                {(hoverRating || rating) >= star ? (
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
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Condividi la tua esperienza con questo prodotto...'
            required
          />
        </Form.Group>

        <div className='d-flex'>
          <Button
            type='submit'
            variant='primary'
            disabled={loading}
            className='me-2'
          >
            {loading ? 'Invio...' : 'Invia recensione'}
          </Button>
          <Button type='button' variant='outline-secondary' onClick={onCancel}>
            Annulla
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ReviewForm;
