import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface Brand {
    _id?: string;
    name: string;
    image?: string;
    main_category_id?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
}

interface BrandState {
    brands: Brand[];
    loading: boolean;
    error: string | null;
}

const initialState: BrandState = {
    brands: [],
    loading: false,
    error: null,
};

export const fetchBrands = createAsyncThunk('brand/fetchBrands', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams || {});
        const response = await https.get(`brands${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch brands');
    }
});

export const fetchBrandsSelect = createAsyncThunk('brand/fetchBrandsSelect', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const queryString = buildQueryString(params || {});
        const response = await https.get(`brands/select${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch brands');
    }
});

export const addBrand = createAsyncThunk('brand/addBrand', async (brand: FormData, { rejectWithValue }) => {
    try {
        const response = await https.post('brands', brand);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add brand');
    }
});

export const updateBrand = createAsyncThunk('brand/updateBrand', async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
        const response = await https.put(`brands/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update brand');
    }
});

export const deleteBrand = createAsyncThunk('brand/deleteBrand', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`brands/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete brand');
    }
});

const brandSlice = createSlice({
    name: 'brand',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action: PayloadAction<Brand[]>) => {
                state.loading = false;
                state.brands = action.payload;
            })
            .addCase(fetchBrandsSelect.fulfilled, (state, action: PayloadAction<Brand[]>) => {
                state.brands = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
                state.brands.unshift(action.payload);
            })
            .addCase(updateBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
                const index = state.brands.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.brands[index] = action.payload;
                }
            })
            .addCase(deleteBrand.fulfilled, (state, action: PayloadAction<string>) => {
                state.brands = state.brands.filter(b => b._id !== action.payload);
            });
    },
});

export default brandSlice.reducer;
