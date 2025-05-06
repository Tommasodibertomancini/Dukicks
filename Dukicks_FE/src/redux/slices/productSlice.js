import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore nel recupero dei prodotti'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (count = 8, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts(count);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          'Errore nel recupero dei prodotti in evidenza'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore nel recupero del prodotto'
      );
    }
  }
);

const initialState = {
  products: [],
  featuredProducts: [],
  product: null,
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError } = productSlice.actions;

export default productSlice.reducer;
