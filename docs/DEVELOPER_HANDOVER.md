# 📦 TÀI LIỆU BÀN GIAO DỰ ÁN

---

## 📋 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Cấu Trúc Thư Mục Chi Tiết](#3-cấu-trúc-thư-mục-chi-tiết)
4. [Tech Stack & Dependencies](#4-tech-stack--dependencies)
5. [Hướng Dẫn Development](#5-hướng-dẫn-development)
6. [API Integration Guide](#6-api-integration-guide)
7. [State Management Guide](#7-state-management-guide)
8. [Component Library](#8-component-library)
9. [Coding Standards](#9-coding-standards)
10. [Testing Guidelines](#10-testing-guidelines)
11. [Deployment Guide](#11-deployment-guide)
12. [Collaboration với Backend](#12-collaboration-với-backend)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mô Tả Dự Án

**Eyewear E-commerce** là nền tảng thương mại điện tử bán kính mắt với các tính năng:

| Tính Năng                | Mô Tả                                           |
| ------------------------ | ----------------------------------------------- |
| 🛒 **E-commerce cơ bản** | Xem sản phẩm, thêm giỏ hàng, thanh toán         |
| 📦 **Pre-order**         | Đặt hàng trước cho sản phẩm chưa có sẵn         |
| 👓 **Gia công kính**     | Cắt kính theo đơn thuốc của khách hàng          |
| 💳 **Thanh toán**        | Tích hợp MoMo, VNPay                            |
| 📊 **Quản lý**           | Dashboard cho Staff, Operations, Manager, Admin |

### 1.2 User Roles

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ROLES                           │
├─────────────┬───────────────────────────────────────────────┤
│ MANAGER     │ Tạo - quản lý dự án                           │
│ ANNOTATOR   │ Thực hiện gán nhãn thủ công                   │
│ REVIEWER    │ Kiểm duyệt dự án                              │
│ ADMIN       │ RBAC, cấu hình hệ thống                       │
└─────────────┴───────────────────────────────────────────────┘
```

### 1.3 Business Flows

#### Pre-order Flow

```
Customer → Chọn sản phẩm Pre-order → Đặt cọc (optional) → Xác nhận Staff
→ Chờ hàng về → Thông báo → Thanh toán → Giao hàng
```

#### Gia Công Kính Flow

```
Customer → Chọn gọng kính → Nhập thông số đơn thuốc (SPH, CYL, AXIS, PD)
→ Validate thông số → Tính giá tròng → Thanh toán
→ Operations (Cắt kính + QC) → Đóng gói → Giao hàng
```

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Pages   │  │ Features │  │  Shared  │  │  Store   │            │
│  │          │  │          │  │          │  │ (Zustand)│            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │             │             │             │                   │
│       └─────────────┴─────────────┴─────────────┘                   │
│                           │                                         │
│                    ┌──────┴──────┐                                  │
│                    │  API Layer  │                                  │
│                    │   (Axios)   │                                  │
│                    └──────┬──────┘                                  │
│                           │                                         │
└───────────────────────────┼─────────────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Team khác)                       │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Action → Router → Page → Feature Component
           → Hook (React Query) → Service → API Client → Backend

Response ← React Query Cache ← Service ← API Response ← Backend
```

### 2.3 State Management Strategy

| Loại State       | Công Cụ                     | Ví Dụ                       |
| ---------------- | --------------------------- | --------------------------- |
| **Server State** | TanStack Query              | Products, Orders, User data |
| **Client State** | Zustand                     | Auth, Cart, UI preferences  |
| **Form State**   | React Hook Form (recommend) | Login form, Checkout form   |
| **URL State**    | React Router                | Filters, pagination, search |

---

## 3. CẤU TRÚC THƯ MỤC CHI TIẾT

```
src/
├── api/                          # 🌐 API Layer
│   ├── apiClients.ts             # authClient, mainClient instances
│   ├── endpoints.ts              # Tất cả API endpoints
│   └── index.ts                  # Barrel export
│
├── lib/                          # ⚙️ Core Configuration
│   ├── axios.ts                  # Axios factory + interceptors
│   ├── react-query.ts            # QueryClient configuration
│   └── index.ts
│
├── store/                        # 📦 Global State (Zustand)
│   ├── auth.store.ts             # Authentication state
│   ├── cart.store.ts             # Shopping cart state
│   └── index.ts
│
├── shared/                       # 🔗 Shared Resources
│   ├── components/               # ⭐ NEW: Reusable UI Components
│   │   ├── ui/                   # UI Component Library
│   │   │   ├── Button.tsx        # Button với variants, sizes
│   │   │   ├── Input.tsx         # Input với validation
│   │   │   ├── Card.tsx          # Card với header/footer
│   │   │   ├── Modal.tsx         # Modal + ConfirmDialog
│   │   │   ├── Spinner.tsx       # Loading indicators
│   │   │   ├── Badge.tsx         # Badge + OrderStatusBadge
│   │   │   ├── Skeleton.tsx      # Loading placeholders
│   │   │   ├── ErrorBoundary.tsx # Error handling
│   │   │   └── index.ts          # Barrel export
│   │   └── index.ts
│   │
│   ├── constants/                # Constants
│   │   ├── messages.ts           # ERROR_MESSAGES, SUCCESS_MESSAGES
│   │   ├── user_role.ts          # UserRole enum
│   │   └── index.ts
│   │
│   ├── types/                    # TypeScript Types
│   │   ├── user.types.ts         # User interface
│   │   ├── product.types.ts      # Product interface
│   │   ├── cart.types.ts         # Cart, CartItem interfaces
│   │   ├── api.types.ts          # ApiClientConfig
│   │   └── index.ts
│   │
│   ├── hooks/                    # Custom Hooks
│   │   └── useApiError.ts        # API error handling hook
│   │
│   └── utils/                    # Utility Functions
│       └── helpers.ts
│
├── features/                     # 🎯 Feature Modules (by EPIC)
│   ├── auth/                     # Authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── customer/                 # EPIC 1: Customer Features
│   │   ├── cart/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── index.ts
│   │
│   ├── staff/                    # EPIC 2: Staff Features
│   ├── operations/               # EPIC 3: Lab, QC, Packing
│   ├── manager/                  # EPIC 4: Policy, Pricing
│   └── admin/                    # EPIC 5: RBAC, Config
│
├── routes/                       # 🛣️ Routing
│   ├── guards/                   # Route Guards
│   │   ├── AuthGuard.tsx         # Require authentication
│   │   ├── GuestGuard.tsx        # Guest only (login, register)
│   │   └── index.ts
│   ├── paths.ts                  # Route paths constants
│   └── index.tsx                 # Router configuration (⭐ Lazy Loading)
│
├── pages/                        # 📄 Page Components
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── customer/
│   │   └── HomePage.tsx
│   └── NotFoundPage.tsx
│
├── components/                   # Layout & Common Components
│   ├── layout/                   # Header, Footer, Sidebar
│   └── common/                   # App-specific common components
│
└── App.tsx                       # Root component
```

---

## 4. TECH STACK & DEPENDENCIES

### 4.1 Core Dependencies

| Package                 | Version | Purpose                 |
| ----------------------- | ------- | ----------------------- |
| `react`                 | 19.2.0  | UI Library              |
| `react-dom`             | 19.2.0  | React DOM               |
| `react-router-dom`      | 7.12.0  | Routing                 |
| `@tanstack/react-query` | 5.90.16 | Server state management |
| `zustand`               | 5.0.10  | Client state management |
| `axios`                 | 1.13.2  | HTTP client             |

### 4.2 Dev Dependencies

| Package       | Version | Purpose         |
| ------------- | ------- | --------------- |
| `vite`        | 7.2.4   | Build tool      |
| `typescript`  | 5.9.3   | Type checking   |
| `eslint`      | 9.39.2  | Code linting    |
| `prettier`    | 3.7.4   | Code formatting |
| `husky`       | 9.1.7   | Git hooks       |
| `vitest`      | 4.0.17  | Unit testing    |
| `tailwindcss` | 4.1.18  | Styling         |

### 4.3 Path Aliases

```typescript
// Configured in vite.config.ts
'@'           → './src'
'@/api'       → './src/api'
'@/store'     → './src/store'
'@/shared'    → './src/shared'
'@/features'  → './src/features'
'@/lib'       → './src/lib'
'@/routes'    → './src/routes'
'@/pages'     → './src/pages'
'@/components'→ './src/components'
```

---

## 5. HƯỚNG DẪN DEVELOPMENT

### 5.1 Setup Môi Trường

```bash
# 1. Clone repository
git clone <repo-url>
cd Eyewear_Project

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Start development server
npm run dev
```

### 5.2 Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Eyewear Shop
```

### 5.3 NPM Scripts

| Script     | Command            | Description                |
| ---------- | ------------------ | -------------------------- |
| `dev`      | `npm run dev`      | Start dev server           |
| `build`    | `npm run build`    | Production build           |
| `lint`     | `npm run lint`     | Check ESLint               |
| `lint:fix` | `npm run lint:fix` | Fix ESLint errors          |
| `format`   | `npm run format`   | Format code                |
| `validate` | `npm run validate` | Type-check + Lint + Format |
| `test`     | `npm run test`     | Run tests                  |

### 5.4 Development Workflow

```bash
# 1. Tạo branch mới
git checkout -b feat/feature-name

# 2. Code & Test
npm run dev

# 3. Validate trước commit
npm run validate

# 4. Fix nếu có lỗi
npm run validate:fix

# 5. Commit với conventional format
git commit -m "feat: add product listing page"

# 6. Push & Create PR
git push origin feat/feature-name
```

---

## 6. API INTEGRATION GUIDE

### 6.1 API Clients

```typescript
// Import API clients
import { authClient, mainClient } from '@/api'

// authClient: Cho authentication APIs (/auth)
// mainClient: Cho general APIs (/api)
```

### 6.2 Endpoints Configuration

```typescript
// src/api/endpoints.ts
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/items',
    UPDATE: (itemId: string) => `/cart/items/${itemId}`
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`
  },
  PRESCRIPTION: {
    VALIDATE: '/prescription/validate',
    CALCULATE: '/prescription/calculate'
  }
}
```

### 6.3 Tạo Service Mới

```typescript
// features/product/services/product.service.ts
import { mainClient } from '@/api'
import { ENDPOINTS } from '@/api'
import type { Product } from '../types'

export const productService = {
  getAll: () => mainClient.get<Product[]>(ENDPOINTS.PRODUCTS.LIST),

  getById: (id: string) => mainClient.get<Product>(ENDPOINTS.PRODUCTS.DETAIL(id)),

  search: (query: string) =>
    mainClient.get<Product[]>(ENDPOINTS.PRODUCTS.LIST, { params: { q: query } })
}
```

### 6.4 Tạo Hook với React Query

```typescript
// features/product/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../services'

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const
}

// Get All Products
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: productService.getAll,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Get Single Product
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id
  })
}
```

---

## 7. STATE MANAGEMENT GUIDE

### 7.1 Zustand Store Pattern

```typescript
// store/cart.store.ts
import { create } from 'zustand'
import type { CartItem } from '@/shared/types'

interface CartState {
  items: CartItem[]
  isLoading: boolean

  // Actions
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item]
    })),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId)
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    })),

  clearCart: () => set({ items: [] })
}))
```

### 7.2 Sử Dụng Store trong Component

```typescript
// components/Cart.tsx
import { useCartStore } from '@/store'

export function Cart() {
  const { items, removeItem, updateQuantity } = useCartStore()

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div>
      {items.map(item => (
        <CartItem
          key={item.productId}
          item={item}
          onRemove={() => removeItem(item.productId)}
          onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
        />
      ))}
      <div>Total: {total.toLocaleString()}đ</div>
    </div>
  )
}
```

---

## 8. COMPONENT LIBRARY

### 8.1 Available Components

| Component       | Import                   | Description                         |
| --------------- | ------------------------ | ----------------------------------- |
| `Button`        | `@/shared/components/ui` | Button với variants, sizes, loading |
| `Input`         | `@/shared/components/ui` | Input với label, error, icons       |
| `Card`          | `@/shared/components/ui` | Card với header/footer              |
| `Modal`         | `@/shared/components/ui` | Modal với accessibility             |
| `ConfirmDialog` | `@/shared/components/ui` | Confirm dialog                      |
| `Spinner`       | `@/shared/components/ui` | Loading indicator                   |
| `Badge`         | `@/shared/components/ui` | Badge với variants                  |
| `Skeleton`      | `@/shared/components/ui` | Loading placeholder                 |
| `ErrorBoundary` | `@/shared/components/ui` | Error boundary                      |

### 8.2 Usage Examples

```typescript
import {
  Button,
  Input,
  Card,
  Modal,
  Spinner,
  Badge,
  ErrorBoundary
} from '@/shared/components/ui'

// Button
<Button variant="primary" size="lg" isLoading={loading}>
  Submit
</Button>

// Input with validation
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register('email')}
/>

// Card
<Card variant="elevated" header="Order Summary">
  <p>Total: 1,500,000đ</p>
</Card>

// Modal
<Modal isOpen={isOpen} onClose={onClose} title="Confirm Order">
  <p>Are you sure?</p>
</Modal>

// Badge
<Badge variant="success" dot>Active</Badge>
```

---

## 9. CODING STANDARDS

### 9.1 File Naming

| Type      | Convention                  | Example              |
| --------- | --------------------------- | -------------------- |
| Component | PascalCase                  | `ProductCard.tsx`    |
| Hook      | camelCase with `use` prefix | `useProducts.ts`     |
| Service   | camelCase with `.service`   | `product.service.ts` |
| Type      | camelCase with `.types`     | `product.types.ts`   |
| Store     | camelCase with `.store`     | `cart.store.ts`      |
| Constant  | SCREAMING_SNAKE_CASE        | `ERROR_MESSAGES`     |

### 9.2 Component Structure

```typescript
// 1. Imports
import { useState } from 'react'
import type { Product } from '../types'

// 2. Types
interface ProductCardProps {
  product: Product
  onAddToCart: (id: string) => void
}

// 3. Component
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Hooks first
  const [isHovered, setIsHovered] = useState(false)

  // Handlers
  const handleClick = () => {
    onAddToCart(product.id)
  }

  // Render
  return (
    <div onClick={handleClick}>
      {/* ... */}
    </div>
  )
}
```

### 9.3 Import Order

```typescript
// 1. React & React hooks
import { useState, useEffect } from 'react'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'

// 3. Internal modules (@/ aliases)
import { Button } from '@/shared/components/ui'
import { useAuthStore } from '@/store'

// 4. Relative imports
import { ProductCard } from './components'
import type { Product } from './types'
```

### 9.4 Không Được Làm

| ❌ Sai                   | ✅ Đúng                                       |
| ------------------------ | --------------------------------------------- |
| Hardcode API URL         | Import từ `@/api`                             |
| Define types inline      | Import từ `@/shared/types`                    |
| Hardcode messages        | Dùng `ERROR_MESSAGES` từ `@/shared/constants` |
| Call API trong component | Qua Hook → Service → Client                   |
| Import cả thư viện       | Named import chỉ cần dùng                     |

---

## 10. TESTING GUIDELINES

### 10.1 Test Structure

```
src/
└── features/
    └── product/
        ├── components/
        │   ├── ProductCard.tsx
        │   └── ProductCard.test.tsx  ← Test cùng folder
        └── hooks/
            ├── useProducts.ts
            └── useProducts.test.ts
```

### 10.2 Test Template

```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100000
  }

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('calls onAddToCart when clicked', () => {
    const onAddToCart = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onAddToCart).toHaveBeenCalledWith('1')
  })
})
```

### 10.3 Test Commands

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
```

---

## 11. DEPLOYMENT GUIDE

### 11.1 Build for Production

```bash
# Validate + Build
npm run build

# Output: dist/
```

### 11.2 Environment Variables

```env
# Production
VITE_API_URL=https://api.eyewear-shop.com
VITE_APP_NAME=Eyewear Shop
```

### 11.3 Performance Optimization

- ✅ **Code Splitting**: Đã implement với React.lazy
- ✅ **Error Boundaries**: Đã có sẵn
- ⏳ **Image Optimization**: Cần cấu hình CDN
- ⏳ **PWA**: Optional cho offline support

---

## 12. COLLABORATION VỚI BACKEND

### 12.1 API Contract

Frontend và Backend cần thống nhất:

1. **Response Format**

```typescript
interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}
```

2. **Error Format**

```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}
```

### 12.2 Authentication Flow

```
1. Login → Backend trả { accessToken, refreshToken }
2. Frontend lưu tokens vào localStorage
3. Mọi request gửi kèm: Authorization: Bearer {accessToken}
4. Khi 401 → Auto refresh hoặc redirect login
```

### 12.3 Prescription API Contract

```typescript
// POST /prescription/validate
interface PrescriptionRequest {
  rightEye: {
    sph: number // -20.00 to +20.00
    cyl: number // -6.00 to +6.00
    axis: number // 1 to 180
  }
  leftEye: {
    sph: number
    cyl: number
    axis: number
  }
  pd: number // 50 to 80 (Pupillary Distance)
}

// POST /prescription/calculate
interface PrescriptionPriceRequest {
  prescription: PrescriptionRequest
  lensType: 'single' | 'bifocal' | 'progressive'
  coatings: ('anti-scratch' | 'blue-light' | 'uv-protection')[]
}

interface PrescriptionPriceResponse {
  basePrice: number
  coatingPrice: number
  laborPrice: number
  totalPrice: number
  estimatedDays: number // Thời gian gia công
}
```

---

## 📌 CHECKLIST KHI TẠO FEATURE MỚI

```
□ 1. Tạo folder trong features/[feature-name]/
□ 2. Define types trong types/[feature].types.ts
□ 3. Thêm endpoints vào api/endpoints.ts
□ 4. Tạo service trong services/[feature].service.ts
□ 5. Tạo hook trong hooks/use[Feature].ts
□ 6. Tạo components trong components/
□ 7. Tạo page wrapper trong pages/
□ 8. Register route trong routes/index.tsx
□ 9. Viết tests
□ 10. Update documentation nếu cần
```

---

## 📞 LIÊN HỆ HỖ TRỢ

- **DevOps Lead**: [Tên] - [Email]
- **Project Manager**: [Tên] - [Email]
- **Backend Lead**: [Tên] - [Email]

---

> **Lưu ý**: Tài liệu này sẽ được cập nhật thường xuyên. Vui lòng kiểm tra phiên bản mới nhất trước khi development.
