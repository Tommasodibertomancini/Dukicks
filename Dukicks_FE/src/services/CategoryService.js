import api from './api';

const categoryService = {
  getCategories: () => api.get('categories'),

  getCategoryById: (id) => api.get(`categories/${id}`),

  createCategory: (categoryData) => api.post('categories', categoryData),

  updateCategory: (categoryData) => api.put('categories', categoryData),

  deleteCategory: (id) => api.delete(`categories/${id}`),
};

export default categoryService;
