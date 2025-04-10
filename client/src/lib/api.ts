import { 
  LoginCredentials, 
  User, 
  UserReply, 
  Question,
  AddQuestion,
  UpdateQuestion,
  SendMessage
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
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies for auth
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  return handleResponse(response);
};

// Authentication services
export const AuthAPI = {
  // Login to the system
  login: async (credentials: LoginCredentials) => {
    return fetchWithAuth('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  // Logout from the system
  logout: async () => {
    return fetchWithAuth('/logout', {
      method: 'POST',
    });
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
        user_id: userIds
      }),
    });
  },
  
  // Delete user
  deleteUser: async (userId: number, advisorId: number) => {
    return fetchWithAuth(`/delete_user/${userId}?advisor_id=${advisorId}`, {
      method: 'DELETE'
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