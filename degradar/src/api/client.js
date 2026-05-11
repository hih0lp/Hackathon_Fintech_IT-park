const API_BASE_URL = 'https://back.psbsmartedu.ru'

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=')
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '')
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

function getToken() {
  return getCookie('accessToken')
}

function setTokens(access, refresh) {
  setCookie('accessToken', access)
  setCookie('refreshToken', refresh)
}

function clearTokens() {
  deleteCookie('accessToken')
  deleteCookie('refreshToken')
}

async function refreshAccessToken() {
  const refreshToken = getCookie('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    clearTokens()
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()
  setTokens(data.access, data.refresh)
  return data.access
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // If token expired, try to refresh
  if (response.status === 401 && token) {
    try {
      const newToken = await refreshAccessToken()
      headers.Authorization = `Bearer ${newToken}`
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch {
      clearTokens()
      window.location.href = '/login'
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    // Handle field-specific errors (e.g., {email: ["..."], password: ["..."]})
    const fieldErrors = Object.entries(error)
      .filter(([key]) => key !== 'detail' && key !== 'message')
      .map(([key, messages]) => {
        if (Array.isArray(messages)) {
          return `${key}: ${messages.join(', ')}`
        }
        return `${key}: ${messages}`
      })
    
    if (fieldErrors.length > 0) {
      throw new Error(fieldErrors.join('; '))
    }
    
    throw new Error(error.detail || error.message || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Auth API
export const auth = {
  login: (email, password) =>
    apiRequest('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, password2) =>
    apiRequest('/users/register/', {
      method: 'POST',
      body: JSON.stringify({ email, password, password2 }),
    }),

  verifyCode: (email, code) =>
    apiRequest('/users/verify-code/', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendCode: (email) =>
    apiRequest('/users/resend-code/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  setTokens,
  clearTokens,
  getToken,
}

// Projects API
export const projects = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/projects/${query ? '?' + query : ''}`)
  },

  get: (id) => apiRequest(`/projects/${id}/`),

  create: (data) => {
    // Handle FormData for file uploads
    if (data instanceof FormData) {
      const token = getToken()
      return fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: data,
      }).then(r => {
        if (!r.ok) throw new Error('Failed to create project')
        return r.json()
      })
    }
    return apiRequest('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id, data) =>
    apiRequest(`/projects/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  partialUpdate: (id, data) =>
    apiRequest(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) => apiRequest(`/projects/${id}/`, { method: 'DELETE' }),

  uploadFiles: (projectId, files) => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const token = getToken()
    return fetch(`${API_BASE_URL}/projects/${projectId}/upload/`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    }).then(r => {
      if (!r.ok) throw new Error('Failed to upload files')
      return r.json()
    })
  },

  deleteFile: (fileId) =>
    apiRequest(`/projects/files/${fileId}/`, { method: 'DELETE' }),
}

// Chats API
export const chats = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/chats/${query ? '?' + query : ''}`)
  },

  create: (data) =>
    apiRequest('/chats/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id) => apiRequest(`/chats/${id}/`, { method: 'DELETE' }),

  getMessages: (chatId, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/chats/${chatId}/messages/${query ? '?' + query : ''}`)
  },
}

// Tasks API
export const tasks = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/tasks/${query ? '?' + query : ''}`)
  },

  get: (id) => apiRequest(`/tasks/${id}/`),

  create: (chatId, titles) =>
    apiRequest('/tasks/create/', {
      method: 'POST',
      body: JSON.stringify({ chat_id: chatId, titles }),
    }),

  update: (id, data) =>
    apiRequest(`/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  partialUpdate: (id, data) =>
    apiRequest(`/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) => apiRequest(`/tasks/${id}/`, { method: 'DELETE' }),
}

export default { auth, projects, chats, tasks }
