import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

export interface MainCategory {
    _id?: string;
    name: string;
    description: string;
    image: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface MainCategoryState {
    mainCategories: MainCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: MainCategoryState = {
    mainCategories: [],
    loading: false,
    error: null,
};

export const fetchMainCategories = createAsyncThunk('mainCategory/fetchMainCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await https.get('main-categories');
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch main categories');
    }
});

export const addMainCategory = createAsyncThunk('mainCategory/addMainCategory', async (mainCategory: MainCategory, { rejectWithValue }) => {
    try {
        const response = await https.post('main-categories', mainCategory);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to add main category');
    }
});

export const updateMainCategory = createAsyncThunk('mainCategory/updateMainCategory', async ({ id, mainCategory }: { id: string; mainCategory: Partial<MainCategory> }, { rejectWithValue }) => {
    try {
        const response = await https.put(`main-categories/${id}`, mainCategory);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update main category');
    }
});

export const deleteMainCategory = createAsyncThunk('mainCategory/deleteMainCategory', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`main-categories/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete main category');
    }
});

const mainCategorySlice = createSlice({
    name: 'mainCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMainCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMainCategories.fulfilled, (state, action: PayloadAction<MainCategory[]>) => {
                state.loading = false;
                state.mainCategories = action.payload;
            })
            .addCase(fetchMainCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addMainCategory.fulfilled, (state, action: PayloadAction<MainCategory>) => {
                state.mainCategories.unshift(action.payload);
            })
            .addCase(updateMainCategory.fulfilled, (state, action: PayloadAction<MainCategory>) => {
                const index = state.mainCategories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.mainCategories[index] = action.payload;
                }
            })
            .addCase(deleteMainCategory.fulfilled, (state, action: PayloadAction<string>) => {
                state.mainCategories = state.mainCategories.filter(c => c._id !== action.payload);
            });
    },
});

export default mainCategorySlice.reducer;
