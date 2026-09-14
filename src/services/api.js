/**
 * API Service for Fake Job Detection
 * Communicates with the Node.js + Express backend at http://localhost:5000/api
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fake-job-detection-4ezv.onrender.com/api';

/**
 * Generic Fetch wrapper with JSON parsing and Authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = resJson.message || resJson.error;
    if (!errorMsg && resJson.errors) {
      if (typeof resJson.errors === 'object') {
        errorMsg = Object.values(resJson.errors).join(', ');
      }
    }
    throw new Error(errorMsg || `Request failed with status ${response.status}`);
  }

  return resJson.data !== undefined ? resJson.data : resJson;
}

/* ==========================================================================
   AUTHENTICATION APIS
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/me
   ========================================================================== */

export async function registerUser(userData) {
  return await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function loginUser(email, password) {
  return await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function loginDemo() {
  return await request('/auth/demo', {
    method: 'POST'
  });
}

export async function logoutUser() {
  localStorage.removeItem('token');
  return { success: true };
}

export async function getCurrentUser() {
  const data = await request('/auth/me');
  return data?.user || data;
}

/* ==========================================================================
   ANALYSIS APIS
   POST /api/analysis/text
   POST /api/analysis/url
   POST /api/analysis/image
   POST /api/analysis/voice
   GET  /api/analysis/history
   GET  /api/analysis/:id
   DELETE /api/analysis/:id
   ========================================================================== */

export async function analyzeText(text) {
  return await request('/analysis/text', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
}

export async function analyzeUrl(url) {
  return await request('/analysis/url', {
    method: 'POST',
    body: JSON.stringify({ url })
  });
}

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return await request('/analysis/image', {
    method: 'POST',
    body: formData
  });
}

export async function analyzeVoice(audioBlob, transcription = '') {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  if (transcription) {
    formData.append('transcription', transcription);
  }
  return await request('/analysis/voice', {
    method: 'POST',
    body: formData
  });
}

export async function getAnalysisHistory() {
  return await request('/analysis/history');
}

export async function getAnalysisById(id) {
  return await request(`/analysis/${id}`);
}

export async function deleteAnalysis(id) {
  return await request(`/analysis/${id}`, {
    method: 'DELETE'
  });
}

/* ==========================================================================
   DASHBOARD STATS API
   GET /api/dashboard/stats
   ========================================================================== */

export async function getDashboardStats() {
  const data = await request('/dashboard/stats');
  return {
    ...data,
    totalAnalyses: data.totalAnalyses ?? data.total ?? 0,
    safeJobs: data.safeJobs ?? data.lowRisk ?? 0
  };
}

/* ==========================================================================
   USER PROFILE APIS
   GET /api/users/me
   PUT /api/users/me
   ========================================================================== */

export async function getProfile() {
  return await request('/users/me');
}

export async function updateProfile(profileData) {
  return await request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}
