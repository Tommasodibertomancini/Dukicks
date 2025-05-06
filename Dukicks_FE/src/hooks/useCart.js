/* eslint-disable no-unused-vars */
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../redux/slices/cartSlice';
import { useAuth } from './useAuth';

export const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, summary, isLoading, error } = useSelector(
    (state) => state.cart
  );

  const loadCart = () => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  };

  const addItem = async (productId, sizeId, quantity) => {
    if (!isAuthenticated) return false;

    try {
      await dispatch(addToCart({ productId, sizeId, quantity })).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    if (!isAuthenticated) return false;

    try {
      await dispatch(updateCartItem({ cartItemId, quantity })).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeItem = async (cartItemId) => {
    if (!isAuthenticated) return false;

    try {
      await dispatch(removeFromCart(cartItemId)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const emptyCart = async () => {
    if (!isAuthenticated) return false;

    try {
      await dispatch(clearCart()).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    summary,
    isLoading,
    error,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
    getCartCount,
  };
};

export default useCart;
