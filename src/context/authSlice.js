import { createSlice } from '@reduxjs/toolkit'

// Check if there is a saved session in localStorage
const savedUser = localStorage.getItem('user')
const savedToken = localStorage.getItem('token')

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called when user logs in successfully
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      // Save to localStorage so session persists after app restart
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    },
    // Called when user logs out
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer