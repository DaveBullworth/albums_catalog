import { $host, $authHost } from './index';

// User Registration
export const registration = async (userData) => {
  const { data } = await $host.post('api/user/registration', userData);
  return data;
};

// Check User Authentication
export const check = async () => {
  try {
    const response = await $authHost.get('api/user/check', { withCredentials: true });
    return response.data; // Возвращает { isAuth: true/false, user: { ... } }
  } catch (error) {
    throw error;
  }
};

// User Login
export const login = async (login, password) => {
  try {
    const response = await $host.post(
      'api/user/login',
      { login, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await $authHost.post('api/user/logout', {}, { withCredentials: true });
  } catch (error) {
    throw error;
  }
};

// Get User Profile
export const getUser = async () => {
  const { data } = await $authHost.get('api/user/profile');
  return data;
};

// Update User Data
export const updateUser = async (userData) => {
  const { data } = await $authHost.put('api/user/update', userData);
  return data;
};

// Delete User Account
export const deleteUser = async () => {
  const { data } = await $authHost.delete('api/user/delete');
  return data;
};
