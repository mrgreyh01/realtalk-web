import { request } from './http.js';

export const auth = {
  signup: (values) => request('/auth/signup', { method: 'POST', body: values }),
  login: (values) => request('/auth/login', { method: 'POST', body: values }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: (signal) => request('/auth/me', { signal }),
};

export const users = {
  list: (signal) => request('/users', { signal }),
};

export const conversations = {
  list: (signal) => request('/conversations', { signal }),
  open: (participantId) => request('/conversations', { method: 'POST', body: { participantId } }),
  messages: (conversationId, params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.before) query.set('before', params.before);
    const suffix = query.toString() ? `?${query}` : '';
    return request(`/conversations/${conversationId}/messages${suffix}`, { signal: params.signal });
  },
  send: (conversationId, body) =>
    request(`/conversations/${conversationId}/messages`, { method: 'POST', body: { body } }),
  markRead: (conversationId) =>
    request(`/conversations/${conversationId}/messages/read`, { method: 'POST' }),
};
