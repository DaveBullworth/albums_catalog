// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

const albumSlice = createSlice({
  name: 'album',
  initialState: {
    albums: [], // Хранение альбомов как массива с их доминирующими цветами
  },
  reducers: {
    setDominantColor: (state, action) => {
      const { albumId, dominantColor } = action.payload;
      const existingAlbum = state.albums.find((album) => album.id === albumId);

      if (existingAlbum) {
        existingAlbum.dominantColor = dominantColor;
      } else {
        state.albums.push({ id: albumId, dominantColor });
      }
    },
  },
});

export const { setDominantColor } = albumSlice.actions;

const store = configureStore({
  reducer: {
    album: albumSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;
