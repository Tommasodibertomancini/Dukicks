import api from './api';

const reviewService = {
  getProductReviews: (productId) => api.get(`reviews/product/${productId}`),

  getUserReviews: () => api.get('reviews/user'),

  getReviewById: (id) => api.get(`reviews/${id}`),

  createReview: (reviewData) => api.post('reviews', reviewData),

  updateReview: (id, reviewData) => api.put(`reviews/${id}`, reviewData),

  deleteReview: (id) => api.delete(`reviews/${id}`),

  canReviewProduct: (productId) =>
    api.get(`reviews/product/${productId}/user-can-review`),

  getProductRating: (productId) =>
    api.get(`reviews/product/${productId}/rating`),
};

export default reviewService;
