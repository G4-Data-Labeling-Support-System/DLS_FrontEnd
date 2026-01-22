// Button Component - Base UI
// TODO: Implement button variants và styles
import type { ComponentProps } from 'react'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}
