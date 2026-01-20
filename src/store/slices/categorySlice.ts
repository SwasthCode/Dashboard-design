import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

export interface Category {
    _id?: string;
    name: string;
    slug?: string;
    description: string;
    main_category_id?: string;
    status?: string;
    image: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk('category/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await https.get('categories');
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch categories');
    }
});

export const fetchCategoryById = createAsyncThunk('category/fetchCategoryById', async (id: string, { rejectWithValue }) => {
    try {
        const response = await https.get(`categories/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch category');
    }
});

export const addCategory = createAsyncThunk('category/addCategory', async (category: Category, { rejectWithValue }) => {
    try {
        const response = await https.post('categories', category);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to add category');
    }
});

export const updateCategory = createAsyncThunk('category/updateCategory', async ({ id, category }: { id: string; category: Partial<Category> }, { rejectWithValue }) => {
    try {
        const response = await https.put(`categories/${id}`, category);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update category');
    }
});

export const deleteCategory = createAsyncThunk('category/deleteCategory', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`categories/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete category');
    }
});

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add Category
            .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.categories.unshift(action.payload);
            })
            // Update Category
            .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
            });
    },
});

export default categorySlice.reducer;
