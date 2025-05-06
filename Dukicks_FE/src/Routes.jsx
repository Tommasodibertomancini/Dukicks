import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Layout
import Layout from './components/layout/Layout';

// Pagine pubbliche
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Pagine Admin
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import UsersPage from './pages/admin/UsersPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, userRole } = useAuth();

  console.log('Protected Route:', { isAuthenticated, userRole, adminOnly });

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (adminOnly && userRole !== 'Admin') {
    console.log('Not admin, redirecting');
    return <Navigate to='/' replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path='/products'
        element={
          <Layout>
            <ProductsPage />
          </Layout>
        }
      />
      <Route
        path='/products/:id'
        element={
          <Layout>
            <ProductDetailPage />
          </Layout>
        }
      />
      <Route
        path='/login'
        element={
          <Layout>
            <LoginPage />
          </Layout>
        }
      />
      <Route
        path='/register'
        element={
          <Layout>
            <RegisterPage />
          </Layout>
        }
      />

      <Route
        path='/cart'
        element={
          <ProtectedRoute>
            <Layout>
              <CartPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/checkout'
        element={
          <ProtectedRoute>
            <Layout>
              <CheckoutPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/thank-you'
        element={
          <ProtectedRoute>
            <Layout>
              <ThankYouPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/wishlist'
        element={
          <ProtectedRoute>
            <Layout>
              <WishlistPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/orders'
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/dashboard'
        element={
          <ProtectedRoute adminOnly={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/products'
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/products/add'
        element={
          <ProtectedRoute adminOnly={true}>
            <AddProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/products/edit/:id'
        element={
          <ProtectedRoute adminOnly={true}>
            <EditProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/orders'
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/users'
        element={
          <ProtectedRoute adminOnly={true}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path='*'
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
