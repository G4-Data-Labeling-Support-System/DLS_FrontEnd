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

  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories'
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/items',
    UPDATE: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear'
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACKING: (id: string) => `/orders/${id}/tracking`
  },

  // Prescription (Custom Lens)
  PRESCRIPTION: {
    VALIDATE: '/prescription/validate',
    CALCULATE: '/prescription/calculate'
  },

  // Payment
  PAYMENT: {
    MOMO: '/payment/momo',
    VNPAY: '/payment/vnpay',
    STATUS: (transactionId: string) => `/payment/status/${transactionId}`
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

  DATASETS: {
    CREATE: '/datasets',
    LIST: '/datasets',
  },

  PROJECTS: {
    CREATE: '/projects',
    LIST: '/projects',
    DETAIL: (id: string) => `/projects/${id}`
  },
} as const
