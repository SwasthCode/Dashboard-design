import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

// --- Types ---
interface Role {
    key: string;
    name: string;
    [key: string]: any;
}

interface User {
    _id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone_number: string;
    role: Role[];
    createdAt: string;
    updatedAt: string;
    status: string;
    is_active: boolean;
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
// Login Thunk
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { mobile?: string; otp?: string; username?: string; password?: string }, { rejectWithValue }) => {
        try {
            let response;
            if (credentials.username && credentials.password) {
                // Username/Password Login
                // The user specified /auth/login and payload { username, password }
                response = await https.post('/auth/login', {
                    username: credentials.username,
                    password: credentials.password
                });
            } else if (credentials.mobile && credentials.otp) {
                // Mobile/OTP Login (Keeping mock or implementing if API exists, currently user focused on username/pass)
                // MOCK DATA FOR UI VALIDATION (Legacy/Alternative flow)
                return new Promise<any>((resolve, reject) => {
                    setTimeout(() => {
                        if (credentials.otp === '1234') {
                            resolve({
                                data: { // Structure to match API response format roughly
                                    access_token: 'dummy_access_token_mobile_otp',
                                    username: credentials.mobile, // Mock user
                                    role: [{ key: 'user' }]
                                }
                            });
                        } else {
                            reject(rejectWithValue('Invalid OTP'));
                        }
                    }, 1000);
                });
            } else {
                return rejectWithValue('Invalid credentials provided');
            }

            // Handle API Response
            if (response && response.success) {
                return response.data;
            } else {
                return rejectWithValue(response?.message || 'Login failed');
            }

        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

// Register Thunk
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: { mobile: string; otp: string }, { rejectWithValue: _rejectWithValue }) => {
        // MOCK DATA FOR UI VALIDATION
        return new Promise<any>((resolve, reject) => {
            setTimeout(() => {
                if (userData.otp === '1234') {
                    resolve({
                        access_token: 'dummy_access_token_ui_validation',
                        user: {
                            id: 'mock_id_2',
                            name: 'New User',
                            email: `user_${userData.mobile}@example.com`,
                            mobile: userData.mobile,
                            role: 'user',
                        },
                    });
                } else {
                    reject(_rejectWithValue('Invalid OTP'));
                }
            }, 1000);
        });
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
                // Response structure from user: { data: { access_token: "...", ...rest } }
                // The thunk validates and returns `response.data` which contains `access_token` and user fields.

                const { access_token, ...rest } = action.payload;

                state.token = access_token;
                state.user = rest as User; // Cast to User type

                if (typeof window !== 'undefined') {
                    if (access_token) localStorage.setItem('token', access_token);
                    if (rest) localStorage.setItem('user', JSON.stringify(rest));
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
