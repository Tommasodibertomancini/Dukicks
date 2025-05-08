import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import { reviewService } from '../../services';
import RatingStars from './RatingStars';
import ReviewForm from './ReviewForm';
import { useSelector } from 'react-redux'; // Aggiungi questa importazione

const ReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth); // Aggiungi questo

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getProductReviews(productId);
        setReviews(response);

        // Verifica se l'utente è autenticato prima di chiamare canReviewProduct
        if (isAuthenticated) {
          try {
            const canReviewResponse = await reviewService.canReviewProduct(
              productId
            );
            setCanReview(canReviewResponse.canReview);
          } catch (error) {
            console.error(
              'Errore nel controllo della possibilità di recensire:',
              error
            );
            setCanReview(false);
          }
        } else {
          // Se l'utente non è autenticato, non può recensire
          setCanReview(false);
        }
      } catch (error) {
        console.error('Errore nel caricamento delle recensioni:', error);
        setError('Si è verificato un errore nel caricamento delle recensioni.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, isAuthenticated]); // Aggiungi isAuthenticated come dipendenza

  const handleReviewSubmitted = (newReview) => {
    setReviews([newReview, ...reviews]);
    setCanReview(false);
    setShowReviewForm(false);
  };

  if (loading) {
    return (
      <div className='text-center my-4'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento recensioni...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className='alert alert-danger' role='alert'>
        {error}
      </div>
    );
  }

  return (
    <div className='reviews-section my-5'>
      <h4 className='mb-4'>Recensioni Cliente</h4>

      {canReview && (
        <div className='mb-4'>
          {showReviewForm ? (
            <ReviewForm
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          ) : (
            <Button
              variant='outline-primary'
              onClick={() => setShowReviewForm(true)}
            >
              Scrivi una recensione
            </Button>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className='text-muted'>
          Nessuna recensione disponibile per questo prodotto.
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <Card key={review.id} className='mb-3'>
              <Card.Body>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div className='d-flex align-items-center'>
                    <div className='me-2'>
                      <FaUser size={20} className='text-secondary' />
                    </div>
                    <div>
                      <h6 className='mb-0'>{review.userName}</h6>
                      <small className='text-muted'>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} size='sm' />
                </div>
                <Card.Text>{review.comment}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
