import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
    name: string;
    category: string;
    price: string;
    stock: string;
    status: string;
    image: string;
    description?: string;
}

interface ProductState {
    products: Product[];
}

const initialState: ProductState = {
    products: [
        {
            name: "Apple Watch Series 7",
            category: "Electronics",
            price: "$299",
            stock: "125",
            status: "In Stock",
            image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80",
        },
        {
            name: "MacBook Pro M1",
            category: "Electronics",
            price: "$1,499",
            stock: "50",
            status: "Low Stock",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80",
        },
        {
            name: "Nike Air Jordan",
            category: "Fashion",
            price: "$199",
            stock: "0",
            status: "Out of Stock",
            image: "https://images.unsplash.com/photo-1600185365926-3a6d3de3ddf0?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80",
        },
    ],
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        addProduct: (state, action: PayloadAction<Product>) => {
            state.products.push(action.payload);
        },
    },
});

export const { addProduct } = productSlice.actions;
export default productSlice.reducer;
