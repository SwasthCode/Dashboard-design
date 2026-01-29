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
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface RoleState {
    roles: Role[];
    selectedRole: Role | null;
    loading: boolean;
    error: string | null;
}

const initialState: RoleState = {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchRoles = createAsyncThunk('role/fetchRoles', async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
        const mergedParams = { sort: { createdAt: -1 }, ...params };
        const queryString = buildQueryString(mergedParams);
        const response = await https.get(`roles${queryString}`);
        return response.data || [];
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch roles');
    }
});

export const fetchRoleById = createAsyncThunk('role/fetchRoleById', async (id: string, { rejectWithValue }) => {
    try {
        const response = await https.get(`roles/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch role');
    }
});

export const createRole = createAsyncThunk('role/createRole', async (role: Role, { rejectWithValue }) => {
    try {
        const response = await https.post('roles', role);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create role');
    }
});

export const updateRole = createAsyncThunk('role/updateRole', async ({ id, data }: { id: string; data: Role }, { rejectWithValue }) => {
    try {
        const response = await https.put(`roles/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update role');
    }
});

export const deleteRole = createAsyncThunk('role/deleteRole', async (id: string, { rejectWithValue }) => {
    try {
        await https.delete(`roles/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to delete role');
    }
});

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        clearSelectedRole: (state) => {
            state.selectedRole = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state: RoleState) => {
            state.loading = true;
            state.error = null;
        };
        const handleRejected = (state: RoleState, action: any) => {
            state.loading = false;
            state.error = action.payload || 'Something went wrong';
        };

        builder
            .addCase(fetchRoles.pending, handlePending)
            .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, handleRejected)

            .addCase(fetchRoleById.pending, handlePending)
            .addCase(fetchRoleById.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                state.selectedRole = action.payload;
            })
            .addCase(fetchRoleById.rejected, handleRejected)

            .addCase(createRole.pending, handlePending)
            .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                state.roles.unshift(action.payload);
            })
            .addCase(createRole.rejected, handleRejected)

            .addCase(updateRole.pending, handlePending)
            .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                const updatedRole = action.payload;
                const index = state.roles.findIndex(r => r._id === updatedRole._id);
                if (index !== -1) {
                    state.roles[index] = updatedRole;
                }
                if (state.selectedRole && state.selectedRole._id === updatedRole._id) {
                    state.selectedRole = updatedRole;
                }
            })
            .addCase(updateRole.rejected, handleRejected)

            .addCase(deleteRole.pending, handlePending)
            .addCase(deleteRole.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.roles = state.roles.filter(r => r._id !== action.payload);
            })
            .addCase(deleteRole.rejected, handleRejected);
    },
});

export const { clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;
