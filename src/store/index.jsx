import { configureStore } from "@reduxjs/toolkit";

import AuthReducer from "./Auth";
import ExpenseReducer from "./Expense";
import ThemeReducer from "./Theme";

const store = configureStore({
    reducer: {
        auth: AuthReducer,
        expense: ExpenseReducer,
        theme: ThemeReducer
    }
})

export default store;