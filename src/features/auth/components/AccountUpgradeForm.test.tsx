import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { AccountUpgradeForm } from './AccountUpgradeForm'

// Mock the auth provider
const mockConvertToAccount = vi.fn()
const mockProfile = {
  id: 'guest-123',
  userId: 'guest-123',
  firstName: 'Guest',
  lastName: 'User',
  email: '',
  location: 'Auckland',
  city: 'Auckland',
  authProvider: 'anonymous',
  emailVerified: false,
  userType: 'guest',
  guestSessionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: vi.fn(() => ({
    convertToAccount: mockConvertToAccount,
    profile: mockProfile
  }))
}))

describe('AccountUpgradeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render upgrade form with all required fields', () => {
    render(<AccountUpgradeForm />)

    expect(screen.getByText(/upgrade your account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upgrade account/i })).toBeInTheDocument()
  })

  it('should show benefits and guest session info', () => {
    render(<AccountUpgradeForm />)

    expect(screen.getByText(/account benefits/i)).toBeInTheDocument()
    expect(screen.getByText(/create unlimited dog profiles/i)).toBeInTheDocument()
    expect(screen.getByText(/message other dog owners/i)).toBeInTheDocument()
    expect(screen.getByText(/save your favorites/i)).toBeInTheDocument()
    expect(screen.getByText(/join the full socialdog community/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<AccountUpgradeForm />)

    const submitButton = screen.getByRole('button', { name: /upgrade account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<AccountUpgradeForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /upgrade account/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('should validate password length', async () => {
    const user = userEvent.setup()
    render(<AccountUpgradeForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /upgrade account/i })

    await user.type(passwordInput, 'short')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup()
    render(<AccountUpgradeForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /upgrade account/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('should handle successful account upgrade', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    mockConvertToAccount.mockResolvedValue({ error: null })

    render(<AccountUpgradeForm onSuccess={mockOnSuccess} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.click(screen.getByRole('checkbox'))

    const submitButton = screen.getByRole('button', { name: /upgrade account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockConvertToAccount).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show loading state during upgrade', async () => {
    const user = userEvent.setup()

    // Mock a delayed response
    mockConvertToAccount.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )

    render(<AccountUpgradeForm />)

    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.click(screen.getByRole('checkbox'))

    const submitButton = screen.getByRole('button', { name: /upgrade account/i })
    await user.click(submitButton)

    // Should show loading text and be disabled
    expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should display error when upgrade fails', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Email already exists'

    mockConvertToAccount.mockResolvedValue({ error: { message: errorMessage } })

    render(<AccountUpgradeForm />)

    // Fill out the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.click(screen.getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: /upgrade account/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should handle cancel button when provided', async () => {
    const user = userEvent.setup()
    const mockOnCancel = vi.fn()

    render(<AccountUpgradeForm onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /maybe later/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should clear errors when user starts typing', async () => {
    const user = userEvent.setup()
    render(<AccountUpgradeForm />)

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /upgrade account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    // Start typing in email field
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 't')

    // Error should be cleared
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
  })

  it('should handle generic upgrade error', async () => {
    const user = userEvent.setup()

    // Mock throwing an error
    mockConvertToAccount.mockRejectedValue(new Error('Network error'))

    render(<AccountUpgradeForm />)

    // Fill out the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.click(screen.getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: /upgrade account/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to upgrade account/i)).toBeInTheDocument()
    })
  })
})