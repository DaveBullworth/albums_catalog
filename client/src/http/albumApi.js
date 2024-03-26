import { $host } from "./index";

export const createAlbum = async (albumData) => {
  try {
    const response = await $host.post('api/album', albumData);
    return response.data;
  } catch (error) {
    // Обработка ошибок, если необходимо
    console.error("Error creating album:", error);
    throw error; // Прокидываем ошибку дальше, чтобы обработать её в вызывающем коде
  }
};


export const fetchAlbums = async () => {
  const { data } = await $host.get('api/album');
  return data;
};

export const editAlbum = async (id, albumData) => {
  try {
    const response = await $host.patch(`api/album/${id}`, albumData);
    return response.data;
  } catch (error) {
    console.error("Error updating album:", error);
    throw error;
  }
};

export const fetchOneAlbum = async (id) => {
  const { data } = await $host.get('api/album/' + id);
  return data;
};

export const deleteAlbum = async (id) => {
  try {
    const response = await $host.delete(`api/album/${id}`);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting album:", error);
    throw error;
  }
};
