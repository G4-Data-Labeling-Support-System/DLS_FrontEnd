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

export const PATH_MANAGER = {
  root: '/manager',
  createProject: '/manager/create-project',
  datasetSetup: '/manager/create-project/dataset-setup',
  guidelinesSetup: '/manager/create-project/guidelines-setup',
  teamAssignment: '/manager/create-project/team-assignment',
  datasetManagement: '/manager/datasets',
  createDataset: '/manager/datasets/create'
};
