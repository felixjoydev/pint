import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}))
