import { jsonRequest } from './client.js';

export const listRequests = (token) =>
  jsonRequest('/requests', {
    token,
    method: 'GET',
  });

export const updateRequestStatus = (token, id, status) =>
  jsonRequest(`/requests/${id}/status`, {
    token,
    method: 'PATCH',
    body: { status },
  });

