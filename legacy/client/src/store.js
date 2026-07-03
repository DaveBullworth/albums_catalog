import { configureStore } from '@reduxjs/toolkit';
import albumReducer from './slices/albumSlice'; // Импортируем редуктор для альбомов
import userReducer from './slices/userSlice'; // Импортируем редуктор для пользователя

const store = configureStore({
  reducer: {
    album: albumReducer, // Редуктор альбомов
    user: userReducer, // Редуктор пользователя
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // По умолчанию, можно добавить thunk если нужно
});

export default store; // Экспортируем конфигурированный store
