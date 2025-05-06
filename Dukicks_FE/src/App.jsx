import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import store from './redux/store';
import { checkAuthStatus } from './redux/slices/authSlice';
import { fetchCart } from './redux/slices/cartSlice';
import Routes from './Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import './styles/animation.css';
import './styles/checkout.css';
import './styles/admin.css';
import './styles/header.css';
import './App.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const stripeOptions = {
  locale: 'it',
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css?family=Roboto:400,500,700',
    },
  ],
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0d6efd',
      borderRadius: '6px',
    },
  },
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = 'DuKicks - Sneakers Store';
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [theme]);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  return <Routes />;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Elements stripe={stripePromise} options={stripeOptions}>
          <AppContent />
          <Toaster
            position='top-right'
            toastOptions={{
              duration: 2000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 2000,
                style: {
                  background: '#28a745',
                },
              },
              error: {
                duration: 2000,
                style: {
                  background: '#dc3545',
                },
              },
            }}
          />
        </Elements>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
