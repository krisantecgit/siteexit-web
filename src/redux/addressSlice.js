import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
    name : "address",
    initialState : [],
    reducers : {
        setAddress : (state, action)=> {
            state.push(action.payload)
        }
    }
})

export const {setAddress} = addressSlice.actions;
export default addressSlice.reducer;