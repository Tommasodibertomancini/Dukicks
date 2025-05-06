import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../../services';
import { showToast } from '../../utils/toastHelper';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore nel recupero della wishlist'
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(productId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Errore durante l'aggiunta alla wishlist"
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (wishlistItemId, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(wishlistItemId);
      return wishlistItemId;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore durante la rimozione dalla wishlist'
      );
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clear',
  async (_, { rejectWithValue }) => {
    try {
      await wishlistService.clearWishlist();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore durante lo svuotamento della wishlist'
      );
    }
  }
);

export const checkInWishlist = createAsyncThunk(
  'wishlist/check',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.isInWishlist(productId);
      return { productId, isInWishlist: response.isInWishlist };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore durante il controllo della wishlist'
      );
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  productStatuses: {},
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;

        state.productStatuses = {};
        action.payload.forEach((item) => {
          state.productStatuses[item.productId] = true;
        });
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // addToWishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.productStatuses[action.payload.productId] = true;
        showToast.success('Prodotto aggiunto ai preferiti', {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: false,
        });
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || "Errore durante l'aggiunta ai preferiti"
        );
      })

      // removeFromWishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        const removedItem = state.items.find(
          (item) => item.id === action.payload
        );
        state.items = state.items.filter((item) => item.id !== action.payload);

        if (removedItem) {
          state.productStatuses[removedItem.productId] = false;
        }

        showToast.success('Prodotto rimosso dai preferiti');
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || 'Errore durante la rimozione dai preferiti'
        );
      })

      // clearWishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.productStatuses = {};
        showToast.success('Lista preferiti svuotata');
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || 'Errore durante lo svuotamento dei preferiti'
        );
      })

      // checkInWishlist
      .addCase(checkInWishlist.fulfilled, (state, action) => {
        state.productStatuses[action.payload.productId] =
          action.payload.isInWishlist;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;

export default wishlistSlice.reducer;
