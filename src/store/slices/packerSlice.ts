import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface Packer {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    status: 'active' | 'inactive';
    address?: string;
    user_id?: string;
    createdAt: string;
    updatedAt: string;
}

interface PackerState {
    packers: Packer[];
    loading: boolean;
    error: string | null;
}

const initialState: PackerState = {
    packers: [],
    loading: false,
    error: null,
};

export const fetchPackers = createAsyncThunk(
    'packer/fetchPackers',
    async (params: QueryParams | undefined, { rejectWithValue }) => {
        try {
            const mergedParams = { sort: { createdAt: -1 }, ...params };
            const queryString = buildQueryString(mergedParams);
            const response = await https.get(`packers${queryString}`);
            return response.data || [];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch packers');
        }
    }
);

export const createPacker = createAsyncThunk(
    'packer/createPacker',
    async (data: Partial<Packer>, { rejectWithValue }) => {
        try {
            const response = await https.post('packers', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create packer');
        }
    }
);

export const updatePacker = createAsyncThunk(
    'packer/updatePacker',
    async ({ id, data }: { id: string; data: Partial<Packer> }, { rejectWithValue }) => {
        try {
            const response = await https.put(`packers/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update packer');
        }
    }
);

export const deletePacker = createAsyncThunk(
    'packer/deletePacker',
    async (id: string, { rejectWithValue }) => {
        try {
            await https.delete(`packers/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete packer');
        }
    }
);

const packerSlice = createSlice({
    name: 'packer',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Packers
            .addCase(fetchPackers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPackers.fulfilled, (state, action: PayloadAction<Packer[]>) => {
                state.loading = false;
                state.packers = action.payload;
            })
            .addCase(fetchPackers.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Packer
            .addCase(createPacker.fulfilled, (state, action: PayloadAction<Packer>) => {
                state.packers.unshift(action.payload);
            })
            // Update Packer
            .addCase(updatePacker.fulfilled, (state, action: PayloadAction<Packer>) => {
                const index = state.packers.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.packers[index] = action.payload;
                }
            })
            // Delete Packer
            .addCase(deletePacker.fulfilled, (state, action: PayloadAction<string>) => {
                state.packers = state.packers.filter((p) => p._id !== action.payload);
            });
    },
});

export default packerSlice.reducer;
