import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SubCategory {
    name: string;
    parent: string;
    description: string;
    products: number;
}

interface SubCategoryState {
    subCategories: SubCategory[];
}

const initialState: SubCategoryState = {
    subCategories: [
        {
            name: "Smartphones",
            parent: "Electronics",
            description: "Mobile phones",
            products: 24,
        },
        {
            name: "Laptops",
            parent: "Electronics",
            description: "Personal computers",
            products: 15,
        },
        {
            name: "Men's Wear",
            parent: "Fashion",
            description: "Clothing for men",
            products: 45,
        },
        {
            name: "Women's Wear",
            parent: "Fashion",
            description: "Clothing for women",
            products: 50,
        },
    ],
};

const subCategorySlice = createSlice({
    name: 'subCategory',
    initialState,
    reducers: {
        addSubCategory: (state, action: PayloadAction<SubCategory>) => {
            state.subCategories.push(action.payload);
        },
    },
});

export const { addSubCategory } = subCategorySlice.actions;
export default subCategorySlice.reducer;
