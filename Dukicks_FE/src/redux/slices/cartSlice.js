import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services';
import { showToast } from '../../utils/toastHelper';

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore nel recupero del carrello'
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, sizeId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, sizeId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Errore durante l'aggiunta al carrello"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(cartItemId, quantity);

      return response;
    } catch (error) {
      console.error('Errore aggiornamento carrello:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          "Errore durante l'aggiornamento del carrello"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (cartItemId, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(cartItemId);
      return cartItemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Errore durante la rimozione dal carrello'
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Errore durante lo svuotamento del carrello'
      );
    }
  }
);

const initialState = {
  items: [],
  summary: {
    subTotal: 0,
    shippingCost: 0,
    total: 0,
    itemCount: 0,
  },
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.summary = {
          subTotal: action.payload.subTotal || 0,
          shippingCost: action.payload.shippingCost || 0,
          total: action.payload.total || 0,
          itemCount: action.payload.itemCount || 0,
        };
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingItemIndex = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (existingItemIndex !== -1) {
          state.items[existingItemIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }

        state.summary.itemCount = state.items.reduce(
          (count, item) => count + item.quantity,
          0
        );
        state.summary.subTotal = state.items.reduce(
          (total, item) => total + item.subTotal,
          0
        );
        state.summary.total =
          state.summary.subTotal + state.summary.shippingCost;

        showToast.success('Prodotto aggiunto al carrello', { autoClose: 3000 });
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || "Errore durante l'aggiunta al carrello",
          {
            autoClose: 3000,
          }
        );
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          console.log('Item ID dal payload:', action.payload.id);
          console.log(
            'Items attualmente nello state:',
            state.items.map((item) => item.id)
          );

          const payloadId = parseInt(action.payload.id, 10);

          const index = state.items.findIndex(
            (item) => item.id === payloadId || item.id === action.payload.id
          );

          if (index !== -1) {
            console.log(
              'Aggiornamento item trovato, vecchia quantity:',
              state.items[index].quantity
            );
            console.log('Nuova quantity:', action.payload.quantity);

            state.items[index] = {
              ...state.items[index],
              ...action.payload,
              quantity: parseInt(action.payload.quantity, 10),
            };

            console.log('Item aggiornato:', state.items[index]);
          } else {
            console.warn('Elemento non trovato con ID:', action.payload.id);
          }

          state.summary.itemCount = state.items.reduce(
            (count, item) => count + item.quantity,
            0
          );
          state.summary.subTotal = state.items.reduce(
            (total, item) => total + item.subTotal,
            0
          );
          state.summary.total =
            state.summary.subTotal + state.summary.shippingCost;

          showToast.success('Carrello aggiornato', {
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: false,
          });
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || "Errore durante l'aggiornamento del carrello",
          { autoClose: 3000 }
        );
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);

        state.summary.itemCount = state.items.reduce(
          (count, item) => count + item.quantity,
          0
        );
        state.summary.subTotal = state.items.reduce(
          (total, item) => total + item.subTotal,
          0
        );
        state.summary.total =
          state.summary.subTotal + state.summary.shippingCost;

        showToast.success('Prodotto rimosso dal carrello', { autoClose: 3000 });
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || 'Errore durante la rimozione dal carrello',
          { autoClose: 3000 }
        );
      })

      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.summary = {
          subTotal: 0,
          shippingCost: 0,
          total: 0,
          itemCount: 0,
        };
        showToast.success('Carrello svuotato', { autoClose: 3000 });
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || 'Errore durante lo svuotamento del carrello',
          { autoClose: 2000 }
        );
      });
  },
});

export const { clearCartError } = cartSlice.actions;

export default cartSlice.reducer;
