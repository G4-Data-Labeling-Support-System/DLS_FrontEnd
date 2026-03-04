// API Endpoints Configuration

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },


  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/update/${id}`,
    UPDATE_PASS: (id: string) => `/users/update/password/${id}`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    ACTIVATE: (id: string) => `/users/${id}/activate`
  },

  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    DELETE: (id: string) => `/projects/${id}/remove`
  },

  DATASETS: {
    LIST: '/datasets',
    DETAIL: (id: string) => `/datasets/${id}`,
    CREATE: '/datasets',
  },

  ASSIGNMENTS: {
    LIST: '/assignments',
    DETAIL: (id: string) => `/assignments/${id}`,
    CREATE: '/assignments',
    DELETE: (id: string) => `/assignments/${id}/remove`,
    BY_PROJECT: (projectId: string) => `/assignments/projects/${projectId}`
  }

} as const
