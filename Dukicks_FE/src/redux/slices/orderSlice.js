import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services';
import { clearCart } from './cartSlice';
import { showToast } from '../../utils/toastHelper';

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getUserOrders();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore nel recupero degli ordini'
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Errore nel recupero dell'ordine"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);

      dispatch(clearCart());

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(
        error.message || "Errore durante la creazione dell'ordine"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderService.cancelOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Errore durante l'annullamento dell'ordine"
      );
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (status = null, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore nel recupero degli ordini'
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Errore durante l'aggiornamento dello stato dell'ordine"
      );
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        console.log('Create order fulfilled with raw payload:', action.payload);
        state.isLoading = false;

        let processedPayload = action.payload;

        if (
          processedPayload &&
          processedPayload.Id !== undefined &&
          processedPayload.id === undefined
        ) {
          processedPayload = {
            ...processedPayload,
            id: processedPayload.Id,
          };
          console.log(
            'Normalized payload with lowercase id:',
            processedPayload
          );
        }

        state.currentOrder = processedPayload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || "Errore durante la creazione dell'ordine"
        );
      })

      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;

        if (state.currentOrder && state.currentOrder.id === action.payload) {
          state.currentOrder.status = 'Cancelled';
        }

        const orderIndex = state.orders.findIndex(
          (order) => order.id === action.payload
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'Cancelled';
        }

        showToast.success('Ordine annullato con successo');
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload || "Errore durante l'annullamento dell'ordine"
        );
      })

      // fetchAllOrders (Admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // updateOrderStatus (Admin)
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;

        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }

        const orderIndex = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }

        showToast.success("Stato dell'ordine aggiornato con successo");
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToast.error(
          action.payload ||
            "Errore durante l'aggiornamento dello stato dell'ordine"
        );
      });
  },
});

export const { clearOrderError, resetCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;
