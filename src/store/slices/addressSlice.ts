import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

export interface Address {
    _id?: string;
    user_id: string;
    name: string;
    shipping_phone: string;
    pincode: string;
    locality: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
    alternate_phone?: string;
    type: 'Home' | 'Work' | 'Other' | string;
    isDefault: boolean;
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
export const fetchAddresses = createAsyncThunk('address/fetchAddresses', async (_, { rejectWithValue }) => {
    try {
        const response = await https.get('addresses');
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch addresses');
    }
});

export const createAddress = createAsyncThunk('address/createAddress', async (address: Partial<Address>, { rejectWithValue }) => {
    try {
        const response = await https.post('addresses', address);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create address');
    }
});

export const updateAddress = createAsyncThunk('address/updateAddress', async ({ id, data }: { id: string; data: Partial<Address> }, { rejectWithValue }) => {
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
            // Fetch Addresses
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<Address[]>) => {
                state.loading = false;
                state.addresses = action.payload;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Address
            .addCase(createAddress.fulfilled, (state, action: PayloadAction<Address>) => {
                state.addresses.unshift(action.payload);
            })
            // Update Address
            .addCase(updateAddress.fulfilled, (state, action: PayloadAction<Address>) => {
                const index = state.addresses.findIndex(a => a._id === action.payload._id);
                if (index !== -1) {
                    state.addresses[index] = action.payload;
                }
            })
            // Delete Address
            .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
                state.addresses = state.addresses.filter(a => a._id !== action.payload);
            });
    },
});

export default addressSlice.reducer;
