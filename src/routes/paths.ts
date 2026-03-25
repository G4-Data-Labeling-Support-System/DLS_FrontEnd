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
  teamAssignment: '/manager/create-project/team-assignment',
  manageProjectThings: '/manager/manage',
  datasetDetail: '/manager/datasets/:id',
  createDataset: '/manager/datasets/create'
}

export const PATH_ANNOTATOR = {
  root: '/annotator',
  projects: '/annotator/projects',
  projectDetail: '/annotator/projects/:projectId',
  projectAssignments: '/annotator/projects/:projectId/assignments',
  projectDatasets: '/annotator/projects/:projectId/datasets',
  assignmentDetail: '/annotator/projects/:projectId/assignments/:assignmentId',
  taskDetail: (taskId: string) => `/annotator/task/${taskId}`,
  annotation: (taskId: string) => `/annotator/task/${taskId}/annotate`,
  datasetDetail: '/annotator/project/:projectId/dataset/:datasetId'
}

export const PATH_REVIEWER = {
  root: '/reviewer',
  projects: '/reviewer/projects',
  projectDetail: '/reviewer/projects/:projectId',
  PROJECT_DATASETS: '/reviewer/projects/:projectId/datasets',
  PROJECT_ASSIGNMENTS: '/reviewer/projects/:projectId/assignments',
  assignmentDetail: '/reviewer/projects/:projectId/assignments/:assignmentId',
  taskDetail: (taskId: string) => `/reviewer/task/${taskId}`,
  annotation: (taskId: string) => `/reviewer/task/${taskId}/annotate`,
  workspace: (projectId: string) => `/reviewer/workspace/${projectId}`
}
