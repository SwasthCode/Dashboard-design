import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import subCategoryReducer from './slices/subCategorySlice';
import mainCategoryReducer from './slices/mainCategorySlice';
import userReducer from './slices/userSlice';
import reviewReducer from './slices/reviewSlice';
import addressReducer from './slices/addressSlice';
import dashboardReducer from './slices/dashboardSlice';

import orderReducer from './slices/orderSlice';
import roleReducer from './slices/roleSlice';
import brandReducer from './slices/brandSlice';
import invoiceReducer from './slices/invoiceSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    product: productReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    mainCategory: mainCategoryReducer,
    user: userReducer,
    review: reviewReducer,
    address: addressReducer,
    dashboard: dashboardReducer,
    order: orderReducer,
    role: roleReducer,
    brand: brandReducer,
    invoice: invoiceReducer,
});

export default rootReducer;
