export const PATHS = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  },
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`
  },
  CART: '/cart',
  ADMIN: {
    DASHBOARD: '/admin/dashboard'
  },
  NOT_FOUND: '*'
}

export const PATH_MANAGER = {
  root: '/manager',
  createProject: '/manager/create-project',
  editProject: '/manager/projects/edit/:id',
  datasetSetup: '/manager/datasets/setup',
  teamAssignment: '/manager/create-project/team-assignment',
  datasetManagement: '/manager/datasets',
  createDataset: '/manager/datasets/create',
  datasetDetail: '/manager/datasets/:id'
}

export const PATH_ANNOTATOR = {
  root: '/annotator',
  project: '/annotator/project',
  projectDetail: '/annotator/project/:id',
  assignment: '/annotator/assignment',
  taskDetail: (taskId: string) => `/annotator/task/${taskId}`,
  annotation: (taskId: string) => `/annotator/task/${taskId}/annotate`,
  datasetDetail: '/annotator/project/:projectId/dataset/:datasetId'
}

export const PATH_REVIEWER = {
  root: '/reviewer',
  dashboard: '/reviewer',
  workspace: '/reviewer/workspace'
}
