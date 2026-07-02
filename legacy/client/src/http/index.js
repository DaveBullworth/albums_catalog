import axios from 'axios';

axios.defaults.withCredentials = true;
// Base URL for your API
const $host = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Authenticated host with automatic token injection
const $authHost = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

export {
  $host, // For public routes (login, registration)
  $authHost, // For authenticated routes
};
