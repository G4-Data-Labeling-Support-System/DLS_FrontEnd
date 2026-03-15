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
    UPDATE_AVATAR: (id: string) => `/users/${id}/avatar/edit`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    ACTIVATE: (id: string) => `/users/${id}/activate`
  },

  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    DELETE: (id: string) => `/projects/${id}/remove`,
    STATUS: (id: string) => `/projects/${id}/status`
  },

  DATASETS: {
    LIST: '/datasets',
    DETAIL: (id: string) => `/datasets/${id}`,
    ITEMS: (id: string) => `/dataitems/datasets/${id}`,
    CREATE: '/datasets',
    BY_PROJECT: (projectId: string) => `/datasets/project/${projectId}`
  },

  DATA_ITEMS: {
    DETAIL: (id: string) => `/v1/dataitems/${id}`
  },

  ASSIGNMENTS: {
    LIST: '/assignments',
    DETAIL: (id: string) => `/assignments/${id}`,
    UPDATE: (id: string) => `/assignments/${id}`,
    BY_PROJECT: (projectId: string) => `assignments/projects/${projectId}`,
    BY_ANNOTATOR: (annotatorId: string) => `/assignments/annotators/${annotatorId}`,
    DELETE: (id: string) => `/assignments/${id}`,
    CREATE_BY_PROJECT: (projectId: string) => `/assignments/projects/${projectId}`,
    LABELS: (assignmentId: string) => `/assignments/${assignmentId}/labels`
  },

  ANNOTATIONS: {
    LIST: '/annotations',
    DETAIL: (id: string) => `/annotations/${id}`
  },

  GUIDELINES: {
    LIST: (projectId: string) => `/guidelines/project/${projectId}`,
    DETAIL: (id: string) => `/guidelines/${id}`,
    CREATE: (projectId: string) => `/guidelines/project/${projectId}`,
    UPDATE: (id: string) => `/guidelines/${id}`,
    DELETE: (id: string) => `/guidelines/${id}`
  },

  LABELS: {
    LIST: '/labels',
    DETAIL: (id: string) => `/labels/${id}`,
    CREATE: (datasetId: string) => `/datasets/${datasetId}/labels`,
    UPDATE: (id: string) => `/labels/${id}`,
    DELETE: (id: string) => `/labels/${id}`
  },

  REVIEWER: {
    STATS: '/reviewer/stats',
    PROJECT_ITEMS: (projectId: string) => `/reviewer/projects/${projectId}/items`,
    ITEM_DETAIL: (itemId: string) => `/reviewer/items/${itemId}`,
    REVIEW_DECISION: (itemId: string) => `/reviewer/items/${itemId}/review`
  },

  DATAITEMS: {
    BY_DATASET: (datasetId: string) => `/dataitems/datasets/${datasetId}`
  },

  TASKS: {
    BY_ASSIGNMENT: (assignmentId: string) => `/tasks/assignments/${assignmentId}`,
    DETAIL: (taskId: string) => `/tasks/${taskId}`
  }
} as const
