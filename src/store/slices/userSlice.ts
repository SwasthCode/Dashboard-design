import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';

export interface Role {
    _id?: string;
    name: string;
    key?: string;
    role_type?: number;
    role_id?: number;
    is_active?: boolean;
    is_deleted?: boolean;
}

export interface User {
    _id?: string;
    id?: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role?: Role[];
    status: string;
    is_active?: boolean;
    is_deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface UserState {
    users: User[];
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
};

// Async Thunks using https utility and new schema
export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, { rejectWithValue }) => {
    try {
        const response = await https.get('users');
        return response.data || []; // Extract data array
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch users');
    }
});

export const fetchUserById = createAsyncThunk('user/fetchUserById', async (id: string, { rejectWithValue }) => {
    try {
        const response = await https.get(`users/${id}`);
        return response.data; // Extract user data
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch user');
    }
});

export const createUser = createAsyncThunk('user/createUser', async (user: User, { rejectWithValue }) => {
    try {
        const response = await https.post('users', user);
        return response.data; // Extract created user
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create user');
    }
});

export const updateUser = createAsyncThunk('user/updateUser', async (user: User, { rejectWithValue }) => {
    if (!user.id) return rejectWithValue('User ID is required for updates');
    try {
        const response = await https.put(`users/${user.id}`, user);
        return response.data; // Extract updated user
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update user');
    }
});

export const deleteUser = createAsyncThunk('user/deleteUser', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`users/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete user');
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
    },
    extraReducers: (builder) => {
        // Handle common states (loading, error) across thunks
        const handlePending = (state: UserState) => {
            state.loading = true;
            state.error = null;
        };
        const handleRejected = (state: UserState, action: any) => {
            state.loading = false;
            state.error = action.payload || 'Something went wrong';
        };

        builder
            // Fetch Users
            .addCase(fetchUsers.pending, handlePending)
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, handleRejected)

            // Fetch User By ID
            .addCase(fetchUserById.pending, handlePending)
            .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, handleRejected)

            // Create User
            .addCase(createUser.pending, handlePending)
            .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.users.push(action.payload);
            })
            .addCase(createUser.rejected, handleRejected)

            // Update User
            .addCase(updateUser.pending, handlePending)
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, handleRejected)

            // Delete User
            .addCase(deleteUser.pending, handlePending)
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.users = state.users.filter(u => u.id !== action.payload);
            })
            .addCase(deleteUser.rejected, handleRejected);
    },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
