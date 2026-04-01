import axios from 'axios';

// A separate axios instance for auth so we don't cause circular dependencies
// with api.interceptors that imports the store.
const authApi = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Authenticates a user with username/password credentials.
 * @param {Object} credentials - { username, password }
 * @returns {Promise} Axios response with { access, refresh } tokens
 */
export const loginUser = (credentials) => {
  return authApi.post('login/', credentials);
};

/**
 * Registers a new user account.
 * @param {Object} userData - { username, email, first_name, last_name, password, password_confirm }
 * @returns {Promise} Axios response
 */
export const registerUser = (userData) => {
  return authApi.post('register/', userData);
};

/**
 * Logs out the user by blacklisting the refresh token.
 * @param {string} refreshToken - The refresh token to blacklist
 * @param {string|null} accessToken - The current access token for authorization
 * @returns {Promise} Axios response
 */
export const logoutUser = (refreshToken, accessToken) => {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};
  return authApi.post('logout/', { refresh: refreshToken }, { headers });
};

/**
 * Refreshes the access token using the refresh token.
 * @param {string} refreshToken - The refresh token
 * @returns {Promise} Axios response with new { access } token
 */
export const refreshAccessToken = (refreshToken) => {
  return authApi.post('refresh/', { refresh: refreshToken });
};
