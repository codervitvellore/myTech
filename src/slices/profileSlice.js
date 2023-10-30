import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  loading: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, value) {
      state.user = value.payload;
      console.log("state.user-->", state.user);
      console.log("state-->", state);
      console.log("value:-->", value);
      console.log("value.payload-->", value.payload);
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
  },
});
console.log(profileSlice.actions);
console.log(profileSlice.reducer);

export const { setUser, setLoading } = profileSlice.actions;
export default profileSlice.reducer;
