export interface Task {
  id: string
  taskId?: string
  assignmentId?: string
  batchId?: string
  batchLabel: string
  taskName?: string
  name?: string
  filename?: string
  taskStatus?: string
  status?: string
  annotationStatus?: string
  completedItems?: number
  totalItems?: number
  reviewStatus?: string
  [key: string]: string | number | boolean | undefined | object | null
}
