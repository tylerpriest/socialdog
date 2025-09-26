import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { UserProfileForm } from './UserProfileForm'

// Mock the Supabase client
const mockUpdate = vi.fn()
const mockUpload = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: mockUpdate
    })),
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload
      }))
    }
  }))
}))

const mockProfile = {
  id: '123',
  userId: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  location: 'Auckland',
  city: 'Auckland',
  authProvider: 'email' as const,
  emailVerified: true,
  bio: 'Dog lover and trainer',
  profilePhoto: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

describe('UserProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render profile form with all fields', () => {
    render(<UserProfileForm profile={mockProfile} />)

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument()
  })

  it('should pre-populate form with existing profile data', () => {
    render(<UserProfileForm profile={mockProfile} />)

    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Auckland')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dog lover and trainer')).toBeInTheDocument()
  })

  it('should show validation error for empty required fields', async () => {
    const user = userEvent.setup()
    render(<UserProfileForm profile={mockProfile} />)

    // Clear required fields
    await user.clear(screen.getByLabelText(/first name/i))
    await user.clear(screen.getByLabelText(/last name/i))
    await user.clear(screen.getByLabelText(/location/i))

    await user.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/location is required/i)).toBeInTheDocument()
    })
  })

  it('should handle successful profile update', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [{ ...mockProfile, firstName: 'Jane' }],
        error: null
      })
    })

    render(<UserProfileForm profile={mockProfile} onSuccess={mockOnSuccess} />)

    await user.clear(screen.getByLabelText(/first name/i))
    await user.type(screen.getByLabelText(/first name/i), 'Jane')

    await user.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        location: 'Auckland',
        bio: 'Dog lover and trainer'
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle profile photo upload', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'profile.jpg', { type: 'image/jpeg' })

    mockUpload.mockResolvedValue({
      data: { path: 'profiles/123/profile.jpg' },
      error: null
    })

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [{ ...mockProfile, profilePhoto: 'profiles/123/profile.jpg' }],
        error: null
      })
    })

    render(<UserProfileForm profile={mockProfile} />)

    const fileInput = screen.getByLabelText(/profile photo/i)
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('123/'),
        file
      )
    })
  })

  it('should handle update error', async () => {
    const user = userEvent.setup()

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })
    })

    render(<UserProfileForm profile={mockProfile} />)

    await user.type(screen.getByLabelText(/first name/i), 'Updated')
    await user.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 1000))
      )
    })

    render(<UserProfileForm profile={mockProfile} />)

    const submitButton = screen.getByRole('button', { name: /update profile/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/updating/i)).toBeInTheDocument()
  })

  it('should validate bio length', async () => {
    const user = userEvent.setup()
    render(<UserProfileForm profile={mockProfile} />)

    const bioInput = screen.getByLabelText(/bio/i)
    const longBio = 'x'.repeat(501) // Over 500 character limit

    await user.clear(bioInput)
    await user.type(bioInput, longBio)
    await user.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => {
      expect(screen.getByText(/bio must be less than 500 characters/i)).toBeInTheDocument()
    })
  })
})