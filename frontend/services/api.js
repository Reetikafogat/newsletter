const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper function to get user data from localStorage
const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to set user data in localStorage
const setUserData = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

const api = {
  // Authentication methods
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Registration failed");
    }
    
    const data = await res.json();
    setAuthToken(data.token);
    setUserData(data.user);
    return data;
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Login failed");
    }
    
    const data = await res.json();
    setAuthToken(data.token);
    setUserData(data.user);
    return data;
  },

  logout: async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setAuthToken(null);
    setUserData(null);
  },

  getCurrentUser: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to get user data");
    }
    
    const data = await res.json();
    setUserData(data.user);
    return data;
  },

  updateProfile: async (profileData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const res = await fetch(`${API_BASE}/api/auth/update-profile`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update profile");
    }
    
    const data = await res.json();
    setUserData(data.user);
    return data;
  },

  // Legacy subscribe method (keeping for backward compatibility)
  subscribe: async (data) => {
    const res = await fetch(`${API_BASE}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to subscribe");
    return res.json();
  },

  // News methods
  getNews: async (params = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);

    const res = await fetch(`${API_BASE}/api/news?${queryParams}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch news");
    }
    
    return res.json();
  },

  getNewsCategories: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const res = await fetch(`${API_BASE}/api/news/categories`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch categories");
    }
    
    return res.json();
  },

  getNewsArticle: async (id) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const res = await fetch(`${API_BASE}/api/news/${id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch article");
    }
    
    return res.json();
  },

  // Utility methods
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

export default api; 