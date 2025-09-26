import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './RegisterForm'

// Mock the Supabase client
const mockSignUp = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp
    }
  }))
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render registration form with all required fields', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/location is required/i)).toBeInTheDocument()
    })
  })

  it('should validate password strength', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('should handle successful registration', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    mockSignUp.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    })

    render(<RegisterForm onSuccess={mockOnSuccess} />)

    // Fill all required fields
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/location/i), 'Auckland')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        options: {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            location: 'Auckland'
          }
        }
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle registration error', async () => {
    const user = userEvent.setup()

    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already exists' }
    })

    render(<RegisterForm />)

    // Fill all required fields
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/location/i), 'Auckland')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()

    // Mock a slow response
    mockSignUp.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 1000))
    )

    render(<RegisterForm />)

    // Fill required fields
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/location/i), 'Auckland')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/creating account/i)).toBeInTheDocument()
  })
})