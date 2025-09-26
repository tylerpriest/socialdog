import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DogProfileForm } from './DogProfileForm'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ id: '123' }], error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: '123' }], error: null }))
        }))
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({
          data: { path: 'dogs/test-photo.jpg' },
          error: null
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/dogs/test-photo.jpg' }
        }))
      }))
    }
  }
}))

const mockOnSuccess = vi.fn()

const defaultProps = {
  onSuccess: mockOnSuccess
}

describe('DogProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required form fields', () => {
    render(<DogProfileForm {...defaultProps} />)

    expect(screen.getByLabelText(/dog name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/breed/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/size/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/temperament/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/photo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create dog profile/i })).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    render(<DogProfileForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /create dog profile/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/dog name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/breed is required/i)).toBeInTheDocument()
      expect(screen.getByText(/age is required/i)).toBeInTheDocument()
    })
  })

  it('validates age is a positive number', async () => {
    render(<DogProfileForm {...defaultProps} />)

    // Fill required fields first
    fireEvent.change(screen.getByLabelText(/dog name/i), { target: { value: 'Test Dog' } })
    fireEvent.change(screen.getByLabelText(/breed/i), { target: { value: 'Test Breed' } })

    const ageInput = screen.getByLabelText(/age/i)
    fireEvent.change(ageInput, { target: { value: '-1' } })

    const submitButton = screen.getByRole('button', { name: /create dog profile/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/age must be a positive number/i)).toBeInTheDocument()
    })
  })

  it('validates photo file size (max 10MB)', async () => {
    render(<DogProfileForm {...defaultProps} />)

    const photoInput = screen.getByLabelText(/photo/i)
    const largefile = new File(['x'.repeat(11 * 1024 * 1024)], 'large-photo.jpg', {
      type: 'image/jpeg'
    })

    fireEvent.change(photoInput, { target: { files: [largefile] } })

    await waitFor(() => {
      expect(screen.getByText(/photo must be less than 10MB/i)).toBeInTheDocument()
    })
  })

  it('validates photo file type', async () => {
    render(<DogProfileForm {...defaultProps} />)

    const photoInput = screen.getByLabelText(/photo/i)
    const invalidFile = new File(['content'], 'document.pdf', {
      type: 'application/pdf'
    })

    fireEvent.change(photoInput, { target: { files: [invalidFile] } })

    await waitFor(() => {
      expect(screen.getByText(/please select a valid image file/i)).toBeInTheDocument()
    })
  })

  it('validates bio character limit (300 characters)', async () => {
    render(<DogProfileForm {...defaultProps} />)

    const bioInput = screen.getByLabelText(/bio/i)
    const longBio = 'a'.repeat(301)
    fireEvent.change(bioInput, { target: { value: longBio } })

    expect(screen.getByText(/301\/300/i)).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: /create dog profile/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/bio must be 300 characters or less/i)).toBeInTheDocument()
    })
  })

  it('shows character count for bio field', () => {
    render(<DogProfileForm {...defaultProps} />)

    const bioInput = screen.getByLabelText(/bio/i)
    fireEvent.change(bioInput, { target: { value: 'Test bio content' } })

    expect(screen.getByText(/16\/300/i)).toBeInTheDocument()
  })

  it('successfully creates dog profile with valid data', async () => {
    render(<DogProfileForm {...defaultProps} />)

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/dog name/i), { target: { value: 'Buddy' } })
    fireEvent.change(screen.getByLabelText(/breed/i), { target: { value: 'Golden Retriever' } })
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: 'male' } })
    fireEvent.change(screen.getByLabelText(/size/i), { target: { value: 'large' } })
    fireEvent.change(screen.getByLabelText(/temperament/i), { target: { value: 'friendly' } })
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: 'A friendly golden retriever who loves to play fetch.' } })

    // Add photo
    const photoInput = screen.getByLabelText(/photo/i)
    const validFile = new File(['photo content'], 'buddy.jpg', { type: 'image/jpeg' })
    fireEvent.change(photoInput, { target: { files: [validFile] } })

    const submitButton = screen.getByRole('button', { name: /create dog profile/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('displays loading state during form submission', async () => {
    render(<DogProfileForm {...defaultProps} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/dog name/i), { target: { value: 'Buddy' } })
    fireEvent.change(screen.getByLabelText(/breed/i), { target: { value: 'Golden Retriever' } })
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '3' } })

    const submitButton = screen.getByRole('button', { name: /create dog profile/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/creating profile.../i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('handles edit mode for existing dog profile', async () => {
    const existingDog = {
      id: '123',
      ownerId: 'user123',
      name: 'Max',
      primaryBreed: 'Labrador',
      breed: 'Labrador', // Legacy compatibility
      age: 5,
      dateOfBirth: '2019-01-01',
      gender: 'male' as 'male',
      size: 'large' as 'large',
      weight: 30,
      temperament: ['playful'],
      photos: ['https://example.com/max.jpg'],
      photo_url: 'https://example.com/max.jpg', // Legacy compatibility
      vaccinationStatus: 'up-to-date' as const,
      vaccinated: true,
      neutered: true,
      puppyNotVaccinated: false,
      energyLevel: 'high' as 'high',
      trainingLevel: 'intermediate' as 'intermediate',
      socialization: 'excellent' as 'excellent',
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      interactionStyles: ['fetch', 'swimming'],
      bio: 'Loves swimming and fetching balls.',
      location: {
        lat: -36.8485,
        lng: 174.7633
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    render(<DogProfileForm {...defaultProps} dogProfile={existingDog} />)

    expect(screen.getByDisplayValue('Max')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Labrador')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Loves swimming and fetching balls.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update dog profile/i })).toBeInTheDocument()
  })
})