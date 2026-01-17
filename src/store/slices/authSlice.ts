import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import https from '../../utils/https'; // Commented out for mock mode to avoid unused variable warning

// --- Types ---
interface User {
    id: string;
    name: string;
    email: string;
    role: string | number[];
    [key: string]: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// --- Async Thunks ---

// Login Thunk
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: any, { rejectWithValue: _rejectWithValue }) => {
        // MOCK DATA FOR UI VALIDATION
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    access_token: 'dummy_access_token_ui_validation',
                    user: {
                        id: 'mock_id_1',
                        name: 'Mock User',
                        email: credentials.email || 'mock@example.com',
                        role: 'admin',
                    },
                });
            }, 1000);
        });

        /* -- Real API Call (Uncomment when backend is ready) --
        try {
            const response = await https.post('/auth/login', credentials);
            return response;
        } catch (error: any) {
            // Return a custom error message from backend or a default message
            return _rejectWithValue(error.data?.message || error.message || 'Login failed');
        }
        */
    }
);

// Register Thunk
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: any, { rejectWithValue: _rejectWithValue }) => {
        // MOCK DATA FOR UI VALIDATION
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve({
                    access_token: 'dummy_access_token_ui_validation',
                    user: {
                        id: 'mock_id_2',
                        name: userData.name || 'Mock User',
                        email: userData.email || 'mock@example.com',
                        role: 'user',
                    },
                });
            }, 1000);
        });

        /* -- Real API Call (Uncomment when backend is ready) --
        try {
            const response = await https.post('/auth/register', userData);
            return response;
        } catch (error: any) {
            return _rejectWithValue(error.data?.message || error.message || 'Registration failed');
        }
        */
    }
);

// --- Slice ---

const initialState: AuthState = {
    user: typeof window !== 'undefined' && localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || 'null')
        : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    status: 'idle',
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            state.error = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded';
                // Check if the response structure matches expectations. 
                // Assuming response has { access_token, user } or similar.
                // Adjust based on actual backend response.
                const { access_token, ...rest } = action.payload; // Example destructuring

                // If the backend returns the token directly or nested
                const token = access_token || action.payload.token;
                const user = rest.user || rest; // Fallback if user object is mixed or nested

                state.token = token;
                state.user = user;

                if (typeof window !== 'undefined') {
                    if (token) localStorage.setItem('token', token);
                    if (user) localStorage.setItem('user', JSON.stringify(user));
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded';
                // Assuming register might verify immediately or return user/token
                // Ideally it logs them in too, but sometimes it just returns success.
                // If it returns token/user, update state:
                const { access_token, ...rest } = action.payload;
                const token = access_token || action.payload.token;
                const user = rest.user || rest;

                if (token && user) {
                    state.token = token;
                    state.user = user;
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
