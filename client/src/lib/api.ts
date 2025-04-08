import { InsertMessage, LoginCredentials } from '@shared/schema';
import { apiRequest } from './queryClient';

export const AuthAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    return response.json();
  },
  
  logout: async () => {
    await apiRequest('POST', '/api/auth/logout');
  },
  
  checkAuth: async () => {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    if (response.status === 401) {
      return null;
    }
    
    return response.json();
  },
};

export const MessagesAPI = {
  getAll: async () => {
    const response = await fetch('/api/messages', {
      credentials: 'include',
    });
    return response.json();
  },
  
  get: async (id: number) => {
    const response = await fetch(`/api/messages/${id}`, {
      credentials: 'include',
    });
    return response.json();
  },
  
  create: async (message: InsertMessage) => {
    const response = await apiRequest('POST', '/api/messages', message);
    return response.json();
  },
  
  update: async (id: number, message: Partial<InsertMessage>) => {
    const response = await apiRequest('PATCH', `/api/messages/${id}`, message);
    return response.json();
  },
  
  delete: async (id: number) => {
    await apiRequest('DELETE', `/api/messages/${id}`);
  },
};

export const UsersAPI = {
  getAll: async () => {
    const response = await fetch('/api/users', {
      credentials: 'include',
    });
    return response.json();
  },
  
  getUserReplies: async (userId: number) => {
    const response = await fetch(`/api/users/${userId}/replies`, {
      credentials: 'include',
    });
    return response.json();
  },
  
  deleteUsers: async (userIds: number[]) => {
    await apiRequest('DELETE', '/api/users', { userIds });
  },
  
  sendPromo: async (userIds: number[], contentId: string) => {
    const response = await apiRequest('POST', '/api/send-promo', { userIds, contentId });
    return response.json();
  },
};
