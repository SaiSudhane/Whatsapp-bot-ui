import { 
  LoginCredentials, 
  User, 
  UserReply, 
  Question,
  AddQuestion,
  UpdateQuestion,
  SendMessage,
  LoginResponse, // Added LoginResponse schema
  RefreshRequest // Added RefreshRequest schema
} from '@shared/schema';

// Base API URL
const API_URL = 'https://backend.myadvisor.sg';

// Helper function to handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || `Error: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

// Helper to get auth headers including cookies
const getHeaders = (contentType = 'application/json') => {
  return {
    'Content-Type': contentType,
  };
};

// Helper for making authenticated requests
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('authData');
  const headers = { ...getHeaders(), ...options.headers };
  if (token) {
    try {
      const authData = JSON.parse(token);
      headers.Authorization = `Bearer ${authData.access_token}`;
    } catch (error) {
      console.error('Error parsing authData:', error);
    }
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
    headers,
  });
  return handleResponse(response);
};

// Authentication services
export const AuthAPI = {
  // Login to the system
  login: async (credentials: LoginCredentials) => {
    const response = await fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('authData', JSON.stringify(response)); // Store the entire response
    return response;
  },

  // Refresh token
  refreshToken: async () => {
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    const refreshRequest = new RefreshRequest({ refresh_token: authData.refresh_token });
    const response = await fetchWithAuth('/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshRequest),
    });
    localStorage.setItem('authData', JSON.stringify(response));
    return response;
  },

  // Logout from the system
  logout: async () => {
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    const response = await fetchWithAuth('/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.access_token}` // Send access token for logout
      }
    });
    localStorage.removeItem('authData');
    return response;
  },
};

// User services
export const UsersAPI = {
  // Get all users for an advisor
  getUsers: async (advisorId: number) => {
    return fetchWithAuth(`/users/${advisorId}`) as Promise<User[]>;
  },

  // Get all replies for a specific user
  getUserReplies: async (advisorId: number, userId: number) => {
    return fetchWithAuth(`/users/${advisorId}/replies/${userId}`) as Promise<UserReply[]>;
  },

  // Send message to a user
  sendMessage: async (data: SendMessage) => {
    return fetchWithAuth('/send_message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Send promotional message
  sendPromoMessage: async (contentSid: string, advisorId: number, userIds: number[]) => {
    return fetchWithAuth('/send_message', {
      method: 'POST',
      body: JSON.stringify({
        content_sid: contentSid,
        advisor_id: advisorId,
        user_ids: userIds
      }),
    });
  },

  // Delete user
  deleteUser: async (userId: number, advisorId: number) => {
    return fetchWithAuth('/delete_user', {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId, advisor_id: advisorId }),
    });
  },
};

// Question services
export const QuestionsAPI = {
  // Get all questions for an advisor
  getQuestions: async (advisorId: number) => {
    return fetchWithAuth(`/questions/${advisorId}`) as Promise<{ questions: Question[] }>;
  },

  // Add a new question
  addQuestion: async (question: AddQuestion) => {
    return fetchWithAuth('/questions/add', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },

  // Update an existing question
  updateQuestion: async (id: number, question: UpdateQuestion) => {
    return fetchWithAuth(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(question),
    });
  },

  // Delete a question
  deleteQuestion: async (id: number) => {
    return fetchWithAuth(`/questions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Form submission service
export const FormAPI = {
  submitForm: async (data: any) => {
    return fetchWithAuth('/submit_form', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};