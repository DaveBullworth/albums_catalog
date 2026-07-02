import { $host } from './index';

export const createAlbum = async (albumData) => {
  try {
    const response = await $host.post('api/album', albumData);
    return response.data;
  } catch (error) {
    // Обработка ошибок, если необходимо
    console.error('Error creating album:', error);
    throw error; // Прокидываем ошибку дальше, чтобы обработать её в вызывающем коде
  }
};

export const fetchAlbums = async (page, limit, filters) => {
  let url = `api/album?`;

  if (page && limit) {
    url += `&page=${page}&limit=${limit}`;
  }

  if (filters && Object.keys(filters).length > 0) {
    url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
  }

  const { data } = await $host.get(url);
  return data;
};

export const editAlbum = async (id, albumData) => {
  try {
    const response = await $host.patch(`api/album/${id}`, albumData);
    return response.data;
  } catch (error) {
    console.error('Error updating album:', error);
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
    return response.data;
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
};

export const parseAlbumLink = async (link) => {
  try {
    const response = await $host.get(`api/parse/?link=${link}`);
    return response.data.albumData;
  } catch (error) {
    console.error('Error parsing link:', error);
    throw error;
  }
};
