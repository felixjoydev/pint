import { vi } from 'vitest'

export const mockTenant = {
  id: 'tenant-123',
  subdomain: 'testblog',
  tier: 'free' as const,
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockUser = {
  id: 'user-123',
  tenantId: 'tenant-123',
  clerkId: 'clerk-123',
  email: 'test@example.com',
  onboardingComplete: true,
}

export function mockAuth(userId: string | null = 'clerk-123') {
  const { auth } = require('@clerk/nextjs/server')
  auth.mockResolvedValue({ userId })
}

export function mockPrisma() {
  return {
    tenant: { findUnique: vi.fn(), update: vi.fn() },
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    page: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    widget: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  }
}
