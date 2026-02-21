import { jsonRequest } from './client.js';

export const login = (email, password) =>
  jsonRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

export const register = (payload) =>
  jsonRequest('/auth/register', {
    method: 'POST',
    body: payload,
  });
