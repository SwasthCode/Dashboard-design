import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { buildQueryString } from '../types';

export type OrderStatus = "pending" | "hold" | "ready" | "shipped" | "delivered" | "cancelled" | "returned";

export interface OrderItem {
    _id?: string;
    product_id?: string | null;
    product_name?: string;
    name?: string; // Matching API response
    quantity: number;
    price: number;
    image?: string;
    images?: { url: string; _id: string }[];
    brand_name?: string;
    unit?: string;
    description?: string;
}

export interface Order {
    _id: string;
    user: {
        _id: string;
        first_name: string;
        last_name: string;
        phone_number?: string;
        email?: string;
        profile_image?: string;
    };
    address?: {
        name?: string;
        shipping_phone?: string;
        pincode?: string;
        locality?: string;
        address?: string;
        city?: string;
        state?: string;
        landmark?: string;
        alternate_phone?: string;
        type?: string;
        formatted_address?: string;
    };
    customer_name?: string;
    total_amount: number;
    status: OrderStatus;
    items?: OrderItem[];
    shipping_address?: string;
    shipping_phone?: string;
    packer_id?: string | {
        _id: string;
        first_name: string;
        last_name: string;
    };
    payment_method?: string;
    payment_status?: string;
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
export const fetchOrders = createAsyncThunk('order/fetchOrders', async (params: { filter?: any } = {}, { rejectWithValue }) => {
    try {
        // Prepare params, removing empty filter if present
        const queryParams: any = { ...params };
        if (queryParams.filter && Object.keys(queryParams.filter).length === 0) {
            delete queryParams.filter;
        }

        const queryString = buildQueryString(queryParams);
        console.log("Fetching orders with query:", queryString);
        const response = await https.get(`orders${queryString}`);
        console.log("API Response for orders:", response);

        // The API returns { success: true, data: [...], ... }
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        return response || [];
    } catch (error: any) {
        console.error("Error fetching orders:", error);
        return rejectWithValue(error.message || 'Failed to fetch orders');
    }
});

export const fetchOrderById = createAsyncThunk('order/fetchOrderById', async (id: string, { rejectWithValue }) => {
    try {
        const response = await https.get(`orders/${id}`);
        // Handle both { data: ... } and direct object returns
        return response.data || response;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch order');
    }
});

export const updateOrderStatus = createAsyncThunk('order/updateOrderStatus', async ({ id, status }: { id: string; status: OrderStatus }, { rejectWithValue }) => {
    try {
        const response = await https.put(`orders/${id}`, { status });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update order status');
    }
});

export const updateOrder = createAsyncThunk('order/updateOrder', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
        const response = await https.put(`orders/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update order');
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
                console.log("fetchOrderById fulfilled payload:", action.payload);
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
            })
            // Update Order (General)
            .addCase(updateOrder.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateOrder.fulfilled, (state, action: PayloadAction<Order>) => {
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
            .addCase(updateOrder.rejected, (state, action: any) => {
                state.updating = false;
                state.error = action.payload || 'Failed to update order';
            });
    },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
