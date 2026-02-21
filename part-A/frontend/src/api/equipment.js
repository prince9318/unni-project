import { jsonRequest } from './client.js';

export const listEquipment = (token) =>
  jsonRequest('/equipment', {
    token,
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

export const createEquipment = (token, payload) =>
  jsonRequest('/equipment', {
    token,
    method: 'POST',
    body: payload,
  });

export const requestEquipment = (token, payload) =>
  jsonRequest('/requests', {
    token,
    method: 'POST',
    body: payload,
  });

