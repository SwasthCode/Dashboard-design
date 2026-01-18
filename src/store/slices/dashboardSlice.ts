import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

// --- Types ---

interface MonthlyCount {
    month: string;
    count: number;
}

interface OrdersStats {
    grand_total_orders: number;
    monthly_counts: MonthlyCount[];
}

interface UsersStats {
    grand_total_users: number;
    monthly_counts: MonthlyCount[];
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    mrp: number;
    unit: string;
    images: string[];
    category_id: string;
    subcategory_id: string;
    stock: number;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface DashboardData {
    orders: OrdersStats;
    users: UsersStats;
    recent_products: Product[];
}

interface DashboardState {
    data: DashboardData | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    status: 'idle',
    error: null,
};

// --- Async Thunks ---

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await https.get('/auth/dashboard');
            if (response && response.success) {
                return response.data;
            } else {
                return rejectWithValue(response?.message || 'Failed to fetch dashboard stats');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch dashboard stats');
        }
    }
);

// --- Slice ---

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardData>) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;
