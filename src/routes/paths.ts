export const PATHS = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  },
  CART: '/cart',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
  },
  NOT_FOUND: '*'
}
