import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Данные о пользователе
  isAuth: null, // Статус авторизации
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; // Сохраняем данные пользователя
      state.isAuth = true; // Статус авторизации устанавливаем в true
    },
    logout: (state) => {
      state.user = null; // Очистка данных о пользователе
      state.isAuth = false; // Статус авторизации сбрасываем
    },
  },
});

export const { setUser, logout } = userSlice.actions; // Экспортируем action creators
export default userSlice.reducer; // Экспортируем редуктор
