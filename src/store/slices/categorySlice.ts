import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
    name: string;
    slug: string;
    description: string;
    status: string;
    image: string;
}

interface CategoryState {
    categories: Category[];
}

const initialState: CategoryState = {
    categories: [
        {
            name: "Electronics",
            slug: "electronics",
            description: "Gadgets and devices",
            status: "Active",
            image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80",
        },
        {
            name: "Fashion",
            slug: "fashion",
            description: "Clothing and accessories",
            status: "Active",
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80",
        },
        {
            name: "Home & Garden",
            slug: "home-garden",
            description: "Furniture and decor",
            status: "Inactive",
            image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80",
        },
    ],
};

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        addCategory: (state, action: PayloadAction<Category>) => {
            state.categories.push(action.payload);
        },
    },
});

export const { addCategory } = categorySlice.actions;
export default categorySlice.reducer;
