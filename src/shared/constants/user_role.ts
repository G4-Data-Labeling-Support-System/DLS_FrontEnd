// User Roles (const object pattern - TypeScript strict mode compatible)
export const UserRole = {
  MANAGER: 'manager',
  ANNOTATOR: 'annotator',
  REVIEWER: 'reviewer',
  ADMIN: 'admin'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
