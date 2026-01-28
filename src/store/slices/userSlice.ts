import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import https from '../../utils/https';
import { QueryParams, buildQueryString } from '../types';

export interface Role {
    _id?: string;
    name: string;
    key?: string;
    role_type?: number;
    role_id?: number;
    is_active?: boolean;
    is_deleted?: boolean;
}

export interface Address {
    _id?: string;
    name?: string;
    shipping_phone?: string;
    pincode?: string;
    locality?: string;
    address?: string;
    city?: string;
    state?: string;
    landmark?: string;
    alternate_phone?: string;
    type?: string;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    _id?: string;
    id?: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    role?: any[];
    status: string;
    is_active?: boolean;
    is_deleted?: boolean;
    image?: string | { url: string; _id: string };
    profile_image?: string;
    addresses?: Address[];
    createdAt?: string;
    updatedAt?: string;
}

interface UserState {
    users: User[];
    roles: Role[];
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
    roleCounts: Record<string, number>;
}

const initialState: UserState = {
    users: [],
    roles: [],
    selectedUser: null,
    loading: false,
    error: null,
    roleCounts: {},
};

// Async Thunks
export const fetchUsers = createAsyncThunk('user/fetchUsers', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams);
        const response = await https.get(`users${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch users');
    }
});

export const fetchRoles = createAsyncThunk('user/fetchRoles', async (params: QueryParams | undefined) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams);
        const response = await https.get(`roles${queryString}`);
        return response.data || [];
    } catch (error: any) {
    }
});

export const fetchUserRoleCounts = createAsyncThunk('user/fetchUserRoleCounts', async (_) => {
    try {
        // Fetch all users to calculate counts client-side
        const response = await https.get('users');
        const allUsers: User[] = response.data || [];

        const counts: Record<string, number> = {};

        allUsers.forEach(user => {
            if (user.role && user.role.length > 0) {
                // Handle both populated role objects and raw ID strings
                const roleData = user.role[0];
                const roleId = typeof roleData === 'object' ? roleData._id : String(roleData);

                if (roleId) {
                    counts[roleId] = (counts[roleId] || 0) + 1;
                }
            }
        });

        return counts;
    } catch (error: any) {
        console.error("Failed to fetch users for counting:", error);
        return {};
    }
});

export const fetchUserById = createAsyncThunk('user/fetchUserById', async (id: string, { rejectWithValue }) => {
    try {
        const response = await https.get(`users/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch user');
    }
});

export const createUser = createAsyncThunk('user/createUser', async (user: User, { rejectWithValue }) => {
    try {
        const response = await https.post('users', user);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create user');
    }
});

export const updateUser = createAsyncThunk('user/updateUser', async ({ id, data }: { id: string; data: User | FormData }, { rejectWithValue }) => {
    try {
        const isFormData = data instanceof FormData;
        const response = await https.put(`users/${id}`, data, { isFormData });
        return response.data;
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
        const handlePending = (state: UserState) => {
            state.loading = true;
            state.error = null;
        };
        const handleRejected = (state: UserState, action: any) => {
            state.loading = false;
            state.error = action.payload || 'Something went wrong';
        };

        builder
            .addCase(fetchUserRoleCounts.fulfilled, (state, action: PayloadAction<Record<string, number>>) => {
                state.roleCounts = action.payload;
            })
            // No loading state needed strictly for counts as it's secondary info

            .addCase(fetchUsers.pending, handlePending)
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, handleRejected)

            .addCase(fetchRoles.pending, handlePending)
            .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, handleRejected)

            .addCase(fetchUserById.pending, handlePending)
            .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, handleRejected)

            .addCase(createUser.pending, handlePending)
            .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.users.push(action.payload);
            })
            .addCase(createUser.rejected, handleRejected)

            .addCase(updateUser.pending, handlePending)
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                const updatedUser = action.payload;
                const index = state.users.findIndex(u => (u.id || u._id) === (updatedUser.id || updatedUser._id));
                if (index !== -1) {
                    // Merge fields instead of replacing to preserve populated data (like roles)
                    state.users[index] = { ...state.users[index], ...updatedUser };
                }
                if (state.selectedUser && (state.selectedUser.id || state.selectedUser._id) === (updatedUser.id || updatedUser._id)) {
                    state.selectedUser = updatedUser;
                }
            })
            .addCase(updateUser.rejected, handleRejected)

            .addCase(deleteUser.pending, handlePending)
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.users = state.users.filter(u => (u.id || u._id) !== action.payload);
            })
            .addCase(deleteUser.rejected, handleRejected);
    },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
