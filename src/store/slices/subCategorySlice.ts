import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface SubCategory {
    _id?: string;
    name: string;
    category_id: string;
    brand_id?: string;
    category?: {
        _id: string;
        name: string;
    };
    brand?: {
        _id: string;
        name: string;
        main_category_id?: string;
        status?: string;
        createdAt?: string;
        updatedAt?: string;
        __v?: number;
    };
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
    subCategories: [
        {
            "_id": "69765d58d5a17c169c710b2e",
            "name": "S 1769364823232",
            "status": "active",
            "category_id": "69765d57d5a17c169c710b29", // Extracted from nested category object for backward compatibility
            "brand_id": "69765d57d5a17c169c710b26", // Extracted from nested brand object for backward compatibility
            "description": "Mock Data SubCategory",
            "createdAt": "2026-01-25T18:13:44.208Z",
            "updatedAt": "2026-01-25T18:13:44.208Z",
            "category": {
                "_id": "69765d57d5a17c169c710b29",
                "name": "C 1769364823232"
            },
            "brand": {
                "_id": "69765d57d5a17c169c710b26",
                "name": "B 1769364823232",
                "main_category_id": "69765d57d5a17c169c710b24",
                "status": "active",
                "createdAt": "2026-01-25T18:13:43.835Z",
                "updatedAt": "2026-01-25T18:13:43.835Z",
                "__v": 0
            }
        }
    ],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchSubCategories = createAsyncThunk('subCategory/fetchSubCategories', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams);
        const response = await https.get(`subcategories${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch sub-categories');
    }
});

export const fetchSubCategoriesSelect = createAsyncThunk('subCategory/fetchSubCategoriesSelect', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const queryString = buildQueryString(params || {});
        const response = await https.get(`subcategories/select${queryString}`);
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

export const updateSubCategory = createAsyncThunk('subCategory/updateSubCategory', async ({ id, subCategory }: { id: string; subCategory: FormData }, { rejectWithValue }) => {
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
            .addCase(fetchSubCategoriesSelect.fulfilled, (state, action: PayloadAction<SubCategory[]>) => {
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
