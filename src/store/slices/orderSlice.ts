import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export type OrderStatus = "pending" | "hold" | "ready" | "shipped" | "delivered" | "cancelled" | "returned";

export interface OrderItem {
    product_id: string;
    product_name?: string;
    name?: string; // Matching API response
    quantity: number;
    price: number;
    image?: string;
}

export interface Order {
    _id: string;
    user: {
        _id: string;
        first_name: string;
        last_name: string;
    };
    customer_name?: string;
    total_amount: number;
    status: OrderStatus;
    items?: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

interface OrderState {
    orders: Order[];
    selectedOrder: Order | null;
    loading: boolean;
    updating: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    updating: false,
    error: null,
};

// Async Thunks
export const fetchOrders = createAsyncThunk('order/fetchOrders', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams);
        const response = await https.get(`orders${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch orders');
    }
});

export const fetchOrderById = createAsyncThunk('order/fetchOrderById', async (id: string, { rejectWithValue }) => {
    try {
        const response = await https.get(`orders/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch order');
    }
});

export const updateOrderStatus = createAsyncThunk('order/updateOrderStatus', async ({ id, status }: { id: string; status: OrderStatus }, { rejectWithValue }) => {
    try {
        const response = await https.put(`orders/${id}/status`, { status });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update order status');
    }
});

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state: OrderState) => {
            state.loading = true;
            state.error = null;
        };
        const handleRejected = (state: OrderState, action: any) => {
            state.loading = false;
            state.error = action.payload || 'Something went wrong';
        };

        builder
            .addCase(fetchOrders.pending, handlePending)
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, handleRejected)

            .addCase(fetchOrderById.pending, handlePending)
            .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, handleRejected)

            .addCase(updateOrderStatus.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
                state.updating = false;
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(o => o._id === updatedOrder._id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
                if (state.selectedOrder && state.selectedOrder._id === updatedOrder._id) {
                    state.selectedOrder = updatedOrder;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action: any) => {
                state.updating = false;
                state.error = action.payload || 'Failed to update order status';
            });
    },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
