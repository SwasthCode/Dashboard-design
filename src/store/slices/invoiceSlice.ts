import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface Invoice {
    _id: string;
    order_id: string | { _id: string, status: string };
    invoice_number: string;
    user_id: {
        _id: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        email?: string;
    };
    items: {
        product_id: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        _id: string;
    }[];
    total_amount: number;
    billing_address: {
        _id: string;
        name: string;
        shipping_phone: string;
        pincode: string;
        locality: string;
        address: string;
        city: string;
        state: string;
        type: string;
    };
    status: string; // e.g., "pending"
    issued_at: string;
    createdAt: string;
    updatedAt: string;
    // Optional fields if they exist in some records
    payment_method?: string;
    due_date?: string;
}

interface InvoiceState {
    invoices: Invoice[];
    loading: boolean;
    error: string | null;
}

const initialState: InvoiceState = {
    invoices: [],
    loading: false,
    error: null,
};

export const fetchInvoices = createAsyncThunk(
    'invoice/fetchInvoices',
    async (params: QueryParams | undefined, { rejectWithValue }) => {
        try {
            const mergedParams = { sort: { createdAt: -1 }, ...params };
            const queryString = buildQueryString(mergedParams);
            const response = await https.get(`invoices${queryString}`);
            // API returns straight array usually based on other slices
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch invoices');
        }
    }
);

export const deleteInvoice = createAsyncThunk(
    'invoice/deleteInvoice',
    async (id: string, { rejectWithValue }) => {
        try {
            await https.delete(`invoices/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete invoice');
        }
    }
);

// Create Invoice
export const createInvoice = createAsyncThunk(
    'invoice/createInvoice',
    async (data: { order_id: string; status?: string }, { rejectWithValue }) => {
        try {
            const response = await https.post('invoices', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create invoice');
        }
    }
);

// Fetch Invoice by Order ID
export const fetchInvoiceByOrder = createAsyncThunk(
    'invoice/fetchInvoiceByOrder',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await https.get(`invoices/order/${orderId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch invoice');
        }
    }
);

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Invoices
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<Invoice[]>) => {
                state.loading = false;
                state.invoices = action.payload;
            })
            .addCase(fetchInvoices.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Invoice
            .addCase(createInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
                state.invoices.unshift(action.payload);
            })
             // Fetch Invoice By Order
            .addCase(fetchInvoiceByOrder.rejected, () => {
                 // Just log or handle silently if needed, usually consumed by unwrap()
            })
            // Delete Invoice
            .addCase(deleteInvoice.fulfilled, (state, action: PayloadAction<string>) => {
                state.invoices = state.invoices.filter((invoice) => invoice._id !== action.payload);
            });
    },
});

export default invoiceSlice.reducer;
