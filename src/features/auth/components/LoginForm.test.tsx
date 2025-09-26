import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

// Mock the auth provider
const mockSignInAsGuest = vi.fn()
vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: vi.fn(() => ({
    signInAsGuest: mockSignInAsGuest
  }))
}))

// Mock the Supabase client
const mockSignIn = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignIn
    }
  }))
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form with required fields and guest option', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue as guest/i })).toBeInTheDocument()
    expect(screen.getByText(/or/i)).toBeInTheDocument()
  })

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Fill password first so form validation runs
    await user.type(emailInput, 'invalid')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for empty password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    mockSignIn.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    })

    render(<LoginForm onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle login error', async () => {
    const user = userEvent.setup()

    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' }
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()

    // Mock a slow response
    mockSignIn.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 1000))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })

  // Guest Authentication Tests
  describe('Guest Authentication', () => {
    it('should handle successful guest login', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()

      mockSignInAsGuest.mockResolvedValue({ error: null })

      render(<LoginForm onSuccess={mockOnSuccess} />)

      const guestButton = screen.getByRole('button', { name: /continue as guest/i })
      await user.click(guestButton)

      await waitFor(() => {
        expect(mockSignInAsGuest).toHaveBeenCalledWith()
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should show loading state during guest login', async () => {
      const user = userEvent.setup()

      // Mock a delayed response
      mockSignInAsGuest.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      render(<LoginForm />)

      const guestButton = screen.getByRole('button', { name: /continue as guest/i })
      await user.click(guestButton)

      // Should show loading text
      expect(screen.getByText(/creating guest session/i)).toBeInTheDocument()

      // Both buttons should be disabled during guest loading
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /creating guest session/i })).toBeDisabled()
    })

    it('should display error when guest login fails', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to create guest session'

      mockSignInAsGuest.mockResolvedValue({ error: { message: errorMessage } })

      render(<LoginForm />)

      const guestButton = screen.getByRole('button', { name: /continue as guest/i })
      await user.click(guestButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should disable guest button when regular login is in progress', async () => {
      const user = userEvent.setup()

      // Mock a delayed response for regular login
      mockSignIn.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
      )

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(signInButton)

      // Guest button should be disabled while regular login is in progress
      expect(screen.getByRole('button', { name: /continue as guest/i })).toBeDisabled()
    })

    it('should handle guest login generic error', async () => {
      const user = userEvent.setup()

      // Mock throwing an error
      mockSignInAsGuest.mockRejectedValue(new Error('Network error'))

      render(<LoginForm />)

      const guestButton = screen.getByRole('button', { name: /continue as guest/i })
      await user.click(guestButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to sign in as guest/i)).toBeInTheDocument()
      })
    })
  })
})