import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock AuthContext for testing
const mockAuthContext = {
  user: null,
  userProfile: null,
  session: null,
  loading: false,
  needsOnboarding: false,
  completeOnboarding: () => {},
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signInWithFacebook: async () => ({ error: null }),
  signOut: async () => {},
  refreshUserProfile: async () => {},
}

// Create a mock auth context provider for tests
import { createContext, useContext } from 'react'

const TestAuthContext = createContext(mockAuthContext)

export function useTestAuth() {
  return useContext(TestAuthContext)
}

interface AllProvidersProps {
  children: ReactNode
  authValue?: typeof mockAuthContext
}

// All providers wrapper for testing
function AllProviders({ children, authValue = mockAuthContext }: AllProvidersProps) {
  return (
    <BrowserRouter>
      <TestAuthContext.Provider value={authValue}>
        {children}
      </TestAuthContext.Provider>
    </BrowserRouter>
  )
}

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: typeof mockAuthContext
}

// Custom render function that wraps components with all providers
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { authValue, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders authValue={authValue}>{children}</AllProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }

// Export mock auth context for custom test scenarios
export { mockAuthContext }

// Helper to create a mock user for authenticated tests
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// Helper to create a mock user profile
export function createMockUserProfile(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    membername: 'TestUser',
    vorname: 'Test',
    nachname: 'User',
    user_type: 'fan' as const,
    profile_image_url: null,
    cover_image_url: null,
    is_verified: false,
    membership_tier: 'basic' as const,
    ...overrides,
  }
}

// Helper to create authenticated mock context
export function createAuthenticatedContext(userOverrides = {}, profileOverrides = {}) {
  return {
    ...mockAuthContext,
    user: createMockUser(userOverrides),
    userProfile: createMockUserProfile(profileOverrides),
    loading: false,
  }
}
