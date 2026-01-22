import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface ProductImage {
    url: string;
    _id: string;
}

export interface Variant {
    id?: string;
    label: string;
    price: number;
    originalPrice: number;
    discount?: string;
    shelfLife?: string;
    manufacturerName?: string;
    manufacturer?: string; // Aligning with backend response
    manufacturerAddress?: string;
    expiryDate?: string;
    _id?: string;
}

export interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    mrp: number;
    unit: string;
    category_id: string;
    subcategory_id: string;
    stock: number;
    isAvailable: boolean;
    images: ProductImage[];
    variants?: Variant[];
    category?: { _id: string; name: string };
    subcategory?: { _id: string; name: string };
    createdAt?: string;
    updatedAt?: string;
}

interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchProducts = createAsyncThunk('product/fetchProducts', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams);
        const response = await https.get(`products${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch products');
    }
});

export const addProduct = createAsyncThunk('product/addProduct', async (product: FormData | Product, { rejectWithValue }) => {
    try {
        const isFormData = product instanceof FormData;
        const response = await https.post('products', product, { isFormData });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to add product');
    }
});

export const updateProduct = createAsyncThunk('product/updateProduct', async ({ id, product }: { id: string; product: FormData | Partial<Product> }, { rejectWithValue }) => {
    try {
        const isFormData = product instanceof FormData;
        const response = await https.put(`products/${id}`, product, { isFormData });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update product');
    }
});

export const deleteProduct = createAsyncThunk('product/deleteProduct', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`products/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete product');
    }
});

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add Product
            .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.products.unshift(action.payload);
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    // Merge data to preserve any already populated fields like category names
                    state.products[index] = { ...state.products[index], ...action.payload };
                }
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            });
    },
});

export default productSlice.reducer;
