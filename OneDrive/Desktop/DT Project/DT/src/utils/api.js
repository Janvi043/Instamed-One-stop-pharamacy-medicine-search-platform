const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');

// Helper function to make API requests
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Handle query parameters
  let url = `${API_URL}${endpoint}`;
  if (options.params) {
    // Filter out undefined or null parameters
    const cleanParams = Object.keys(options.params).reduce((acc, key) => {
      if (options.params[key] !== undefined && options.params[key] !== null) {
        acc[key] = options.params[key];
      }
      return acc;
    }, {});

    if (Object.keys(cleanParams).length > 0) {
      const params = new URLSearchParams(cleanParams);
      url += `?${params.toString()}`;
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        // Only redirect if we're not already on a login/register page 
        // AND this isn't an authentication request itself
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('login') ||
          currentPath.includes('register') ||
          currentPath === '/';
        const isAuthRequest = endpoint.includes('/auth/');

        if (!isAuthPage && !isAuthRequest) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to appropriate login based on stored user type or default to user login
          const userType = localStorage.getItem('userType');
          window.location.href = userType === 'pharmacy' ? '/pharmacy-login' : '/user-login';
        }
      }
      throw { response: { data, status: response.status } };
    }

    return { data };
  } catch (error) {
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  userRegister: (data) => request('/auth/user/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  userLogin: (data) => request('/auth/user/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  pharmacyRegister: (data) => request('/auth/pharmacy/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  pharmacyLogin: (data) => request('/auth/pharmacy/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
};

// User APIs
export const userAPI = {
  getProfile: () => request('/user/profile', { method: 'GET' }),
  updateProfile: (data) => request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (data) => request('/user/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getSearchHistory: () => request('/user/search-history', { method: 'GET' }),
  saveSearch: (data) => request('/user/save-search', {
    method: 'POST',
    body: JSON.stringify(data),
  })
};

// Pharmacy APIs
export const pharmacyAPI = {
  getProfile: () => request('/pharmacy/profile', { method: 'GET' }),
  updateProfile: (data) => request('/pharmacy/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (data) => request('/pharmacy/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getMedicines: (search) => request('/pharmacy/medicines', {
    method: 'GET',
    params: { search }
  }),
  getStats: () => request('/pharmacy/stats', { method: 'GET' }),
  getPharmacyDetails: (id) => request(`/pharmacy/${id}`, { method: 'GET' })
};

// Medicine APIs
export const medicineAPI = {
  addMedicine: (data) => request('/medicine', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMedicine: (id) => request(`/medicine/${id}`, { method: 'GET' }),
  getPrescribedMedicines: () => request('/medicine', { method: 'GET' }),
  updateMedicine: (id, data) => request(`/medicine/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteMedicine: (id) => request(`/medicine/${id}`, { method: 'DELETE' })
};

// Search APIs
export const searchAPI = {
  searchMedicine: (query) => request('/search/medicine', {
    method: 'GET',
    params: { query }
  }),
  searchPharmacy: (query) => request('/search/pharmacy', {
    method: 'GET',
    params: { query }
  }),
  searchIllness: (query) => request('/search/illness', {
    method: 'GET',
    params: { query }
  }),
  getNearbyPharmacies: () => request('/search/nearby-pharmacies', { method: 'GET' }),
  getPharmaciesByLocation: (latitude, longitude, radiusKm = 50) => request('/search/pharmacies-by-location', {
    method: 'GET',
    params: { latitude, longitude, radiusKm }
  }),
  getAllPharmacies: () => request('/search/all-pharmacies', { method: 'GET' }),
  updatePharmacyLocation: (pharmacyId, latitude, longitude) => request(`/search/pharmacy/${pharmacyId}/location`, {
    method: 'PUT',
    body: JSON.stringify({ latitude, longitude })
  }),
  getPharmacyMedicines: (pharmacyId, query) => request(`/search/pharmacy/${pharmacyId}/medicine`, {
    method: 'GET',
    params: { query }
  }),
  getMedicinePharmacies: (medicineId) => request(`/search/medicine/${medicineId}/pharmacies`, { method: 'GET' })
};

export default { request };
