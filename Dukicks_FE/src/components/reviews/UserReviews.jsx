import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaStar, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa';
import { reviewService } from '../../services';
import RatingStars from './RatingStars';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingReview, setEditingReview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    comment: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getUserReviews();
      setReviews(response);
    } catch (error) {
      console.error('Errore nel caricamento delle recensioni:', error);
      setError(
        'Si è verificato un errore nel caricamento delle tue recensioni.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditFormData({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const handleRatingChange = (newRating) => {
    setEditFormData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleCommentChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditFormData({
      rating: 0,
      comment: '',
    });
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    if (editFormData.rating === 0) {
      alert('Seleziona una valutazione');
      return;
    }

    if (!editFormData.comment.trim()) {
      alert('Inserisci un commento');
      return;
    }

    try {
      setLoading(true);
      const updatedReview = await reviewService.updateReview(editingReview.id, {
        productId: editingReview.productId,
        rating: editFormData.rating,
        comment: editFormData.comment,
      });

      setReviews(
        reviews.map((review) =>
          review.id === editingReview.id ? updatedReview : review
        )
      );

      setEditingReview(null);
      setEditFormData({ rating: 0, comment: '' });
    } catch (error) {
      console.error("Errore nell'aggiornamento della recensione:", error);
      alert("Si è verificato un errore nell'aggiornamento della recensione.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      setLoading(true);
      await reviewService.deleteReview(reviewToDelete.id);

      setReviews(reviews.filter((review) => review.id !== reviewToDelete.id));

      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error("Errore nell'eliminazione della recensione:", error);
      alert("Si è verificato un errore nell'eliminazione della recensione.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className='text-center my-4'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento recensioni...</span>
        </Spinner>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return <Alert variant='danger'>{error}</Alert>;
  }

  return (
    <div className='user-reviews'>
      <h4 className='mb-4'>Le tue recensioni</h4>

      {reviews.length === 0 ? (
        <Alert variant='info'>
          Non hai ancora scritto recensioni per i tuoi prodotti.
        </Alert>
      ) : (
        <div>
          {reviews.map((review) => (
            <Card key={review.id} className='mb-3'>
              <Card.Header className='d-flex justify-content-between align-items-center'>
                <span>
                  Recensione per: <strong>{review.productname}</strong>
                </span>
                <RatingStars rating={review.rating} size='sm' />
              </Card.Header>

              <Card.Body>
                {editingReview && editingReview.id === review.id ? (
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
                            {editFormData.rating >= star ? (
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
                        rows={3}
                        value={editFormData.comment}
                        onChange={handleCommentChange}
                      />
                    </Form.Group>

                    <div className='d-flex'>
                      <Button
                        variant='primary'
                        onClick={handleUpdateReview}
                        className='me-2'
                        disabled={loading}
                      >
                        {loading ? 'Salvataggio...' : 'Salva modifiche'}
                      </Button>
                      <Button
                        variant='outline-secondary'
                        onClick={handleCancelEdit}
                      >
                        Annulla
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <>
                    <Card.Text>{review.comment}</Card.Text>
                    <div className='text-muted small'>
                      Scritta il{' '}
                      {new Date(review.createdAt).toLocaleDateString()}
                      {review.updatedAt &&
                        review.updatedAt !== review.createdAt &&
                        ` (modificata il ${new Date(
                          review.updatedAt
                        ).toLocaleDateString()})`}
                    </div>

                    <div className='mt-3'>
                      <Button
                        variant='outline-primary'
                        size='sm'
                        className='me-2'
                        onClick={() => handleEditClick(review)}
                      >
                        <FaEdit className='me-1' /> Modifica
                      </Button>
                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={() => handleDeleteClick(review)}
                      >
                        <FaTrash className='me-1' /> Elimina
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal di conferma eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare questa recensione? Questa azione non può
          essere annullata.
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button variant='danger' onClick={handleConfirmDelete}>
            Elimina
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserReviews;
