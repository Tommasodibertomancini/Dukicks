import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addToCart } from '../../redux/slices/cartSlice';
import { wishlistService } from '../../services';

const AddToCartButton = ({ product, selectedSize, className }) => {
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.cart);
  
  const availableStock = selectedSize 
    ? product.availableSizes.find(s => s.sizeId === selectedSize)?.stock || 0
    : 0;
  
  React.useEffect(() => {
    if (isAuthenticated) {
      const checkWishlist = async () => {
        try {
          const response = await wishlistService.isInWishlist(product.id);
          setIsInWishlist(response.isInWishlist);
        } catch (error) {
          console.error('Errore nel controllo della wishlist:', error);
        }
      };
      
      checkWishlist();
    }
  }, [isAuthenticated, product.id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= availableStock) {
      setQuantity(value);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Seleziona una taglia');
      return;
    }
    
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingCartAdd', JSON.stringify({
        productId: product.id,
        sizeId: selectedSize,
        quantity
      }));
      
      navigate('/login');
      return;
    }
    
    dispatch(addToCart({ 
      productId: product.id, 
      sizeId: selectedSize, 
      quantity 
    }));
  };
  
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setIsAddingToWishlist(true);
    
    try {
      if (isInWishlist) {
        const wishlistResponse = await wishlistService.getWishlist();
        const wishlistItem = wishlistResponse.find(item => item.productId === product.id); // Rimosso .data
        
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(wishlistItem.id);
          setIsInWishlist(false);
          toast.success('Prodotto rimosso dai preferiti');
        }
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
        toast.success('Prodotto aggiunto ai preferiti');
      }
    } catch (error) {
      console.error('Errore nella gestione della wishlist:', error);
      toast.error('Si è verificato un errore');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className={className}>
      <div className="mb-3">
        <Form.Label>Quantità:</Form.Label>
        <InputGroup>
          <Button 
            variant="outline-secondary" 
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Form.Control 
            type="number" 
            value={quantity} 
            onChange={handleQuantityChange}
            min="1"
            max={availableStock}
            className="text-center"
          />
          <Button 
            variant="outline-secondary" 
            onClick={increaseQuantity}
            disabled={quantity >= availableStock}
          >
            +
          </Button>
        </InputGroup>
      </div>
      
      <div className="d-flex">
        <Button
          variant="primary"
          className="me-2 flex-grow-1"
          onClick={handleAddToCart}
          disabled={isLoading || !selectedSize || availableStock === 0}
        >
          <FaShoppingCart className="me-2" />
          {isLoading ? 'Aggiunta...' : 'Aggiungi al carrello'}
        </Button>
        
        <Button
          variant="outline-danger"
          onClick={handleToggleWishlist}
          disabled={isAddingToWishlist}
        >
          {isInWishlist ? <FaHeart /> : <FaRegHeart />}
        </Button>
      </div>
      
      {availableStock === 0 && (
        <p className="text-danger mt-2">Prodotto esaurito</p>
      )}
    </div>
  );
};

export default AddToCartButton;