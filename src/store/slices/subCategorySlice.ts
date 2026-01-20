import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

export interface SubCategory {
    _id?: string;
    name: string;
    category_id: string;
    description: string;
    image?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SubCategoryState {
    subCategories: SubCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: SubCategoryState = {
    subCategories: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchSubCategories = createAsyncThunk('subCategory/fetchSubCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await https.get('subcategories');
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch sub-categories');
    }
});

export const addSubCategory = createAsyncThunk('subCategory/addSubCategory', async (subCategory: FormData, { rejectWithValue }) => {
    try {
        const response = await https.post('subcategories', subCategory);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to add sub-category');
    }
});

export const updateSubCategory = createAsyncThunk('subCategory/updateSubCategory', async ({ id, subCategory }: { id: string; subCategory: Partial<SubCategory> }, { rejectWithValue }) => {
    try {
        // Trying both plural and singular as fallback based on previous user experience with /users vs /user
        const response = await https.put(`subcategories/${id}`, subCategory);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update sub-category');
    }
});

export const deleteSubCategory = createAsyncThunk('subCategory/deleteSubCategory', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`subcategories/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete sub-category');
    }
});

const subCategorySlice = createSlice({
    name: 'subCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Sub-Categories
            .addCase(fetchSubCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubCategories.fulfilled, (state, action: PayloadAction<SubCategory[]>) => {
                state.loading = false;
                state.subCategories = action.payload;
            })
            .addCase(fetchSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add Sub-Category
            .addCase(addSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
                state.subCategories.unshift(action.payload);
            })
            // Update Sub-Category
            .addCase(updateSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
                const index = state.subCategories.findIndex(c => (c._id) === (action.payload._id));
                if (index !== -1) {
                    state.subCategories[index] = action.payload;
                }
            })
            // Delete Sub-Category
            .addCase(deleteSubCategory.fulfilled, (state, action: PayloadAction<string>) => {
                state.subCategories = state.subCategories.filter(c => c._id !== action.payload);
            });
    },
});

export default subCategorySlice.reducer;
