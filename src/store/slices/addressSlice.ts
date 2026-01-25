import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface Address {
    _id?: string;
    name: string;
    shipping_phone: string;
    pincode: string;
    locality: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
    alternate_phone?: string;
    type: string;
    isDefault: boolean;
    user_id?: string;
    userInfo?: {
        fullname: string;
        _id: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface AddressState {
    addresses: Address[];
    loading: boolean;
    error: string | null;
}

const initialState: AddressState = {
    addresses: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchAddresses = createAsyncThunk('address/fetchAddresses', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const queryString = buildQueryString(params || {});
        const response = await https.get(`addresses${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch addresses');
    }
});

export const createAddress = createAsyncThunk('address/createAddress', async (address: Address, { rejectWithValue }) => {
    try {
        const response = await https.post('addresses', address);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create address');
    }
});

export const updateAddress = createAsyncThunk('address/updateAddress', async ({ id, data }: { id: string; data: Address }, { rejectWithValue }) => {
    try {
        const response = await https.put(`addresses/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update address');
    }
});

export const deleteAddress = createAsyncThunk('address/deleteAddress', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`addresses/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete address');
    }
});

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<Address[]>) => {
                state.loading = false;
                state.addresses = action.payload;
            })
            .addCase(fetchAddresses.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAddress.fulfilled, (state, action: PayloadAction<Address>) => {
                state.addresses.unshift(action.payload);
            })
            .addCase(updateAddress.fulfilled, (state, action: PayloadAction<Address>) => {
                const index = state.addresses.findIndex(a => a._id === action.payload._id);
                if (index !== -1) {
                    state.addresses[index] = action.payload;
                }
            })
            .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
                state.addresses = state.addresses.filter(a => a._id !== action.payload);
            });
    },
});

export default addressSlice.reducer;
