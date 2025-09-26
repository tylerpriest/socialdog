import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

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

  it('should render login form with required fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
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
})