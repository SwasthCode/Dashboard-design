import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

export interface Review {
    _id?: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    status: 'Published' | 'Pending';
    userInfo?: {
        fullname: string;
        _id: string;
    };
    image?: string | { url: string; _id: string };
    createdAt?: string;
    updatedAt?: string;
}

interface ReviewState {
    reviews: Review[];
    loading: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    reviews: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchReviews = createAsyncThunk('review/fetchReviews', async (_, { rejectWithValue }) => {
    try {
        const response = await https.get('reviews');
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch reviews');
    }
});

export const createReview = createAsyncThunk('review/createReview', async (review: FormData | Partial<Review>, { rejectWithValue }) => {
    try {
        const isFormData = review instanceof FormData;
        const response = await https.post('reviews', review, { isFormData });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create review');
    }
});

export const updateReview = createAsyncThunk('review/updateReview', async ({ id, data }: { id: string; data: FormData | Partial<Review> }, { rejectWithValue }) => {
    try {
        const isFormData = data instanceof FormData;
        const response = await https.put(`reviews/${id}`, data, { isFormData });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update review');
    }
});

export const deleteReview = createAsyncThunk('review/deleteReview', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`reviews/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete review');
    }
});

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Reviews
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Review
            .addCase(createReview.fulfilled, (state, action: PayloadAction<Review>) => {
                state.reviews.unshift(action.payload);
            })
            // Update Review
            .addCase(updateReview.fulfilled, (state, action: PayloadAction<Review>) => {
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            })
            // Delete Review
            .addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            });
    },
});

export default reviewSlice.reducer;
