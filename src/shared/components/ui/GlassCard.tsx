import type { CardProps } from 'antd'
// eslint-disable-next-line no-duplicate-imports
import { Card } from 'antd'
import React from 'react'

const GlassCard: React.FC<CardProps> = ({ children, style, className, ...props }) => (
  <Card
    {...props}
    className={`glass-card ${className}`}
    style={{
      background: 'rgba(26, 22, 37, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(157, 39, 241, 0.3)',
      borderRadius: '16px',
      ...style
    }}
  >
    {children}
  </Card>
)

export default GlassCard
