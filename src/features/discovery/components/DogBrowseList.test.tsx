import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DogBrowseList } from './DogBrowseList'

// Mock Supabase client
const mockSupabaseQuery = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: mockSupabaseQuery
      }))
    }))
  }
}))

const mockDogs = [
  {
    id: '1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    temperament: 'friendly',
    bio: 'Loves playing fetch and swimming',
    photo_url: 'https://example.com/buddy.jpg',
    location: 'Auckland',
    owner: {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Border Collie',
    age: 2,
    gender: 'female',
    size: 'medium',
    temperament: 'energetic',
    bio: 'Very active and loves agility training',
    photo_url: 'https://example.com/luna.jpg',
    location: 'Wellington',
    owner: {
      firstName: 'Jane',
      lastName: 'Smith'
    }
  }
]

const mockOnDogSelect = vi.fn()

describe('DogBrowseList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default successful response
    mockSupabaseQuery.mockResolvedValue({
      data: mockDogs,
      error: null
    })
  })

  it('renders loading state initially', () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    expect(screen.getByText(/loading dogs.../i)).toBeInTheDocument()
  })

  it('renders list of dogs after loading', async () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
      expect(screen.getByText('Luna')).toBeInTheDocument()
    })

    expect(screen.getByText('Golden Retriever')).toBeInTheDocument()
    expect(screen.getByText('Border Collie')).toBeInTheDocument()
    expect(screen.getByText('3 years old')).toBeInTheDocument()
    expect(screen.getByText('2 years old')).toBeInTheDocument()
  })

  it('displays dog photos with alt text', async () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      const buddyImage = screen.getByAltText('Buddy')
      const lunaImage = screen.getByAltText('Luna')

      expect(buddyImage).toBeInTheDocument()
      expect(lunaImage).toBeInTheDocument()
      expect(buddyImage).toHaveAttribute('src', 'https://example.com/buddy.jpg')
      expect(lunaImage).toHaveAttribute('src', 'https://example.com/luna.jpg')
    })
  })

  it('shows owner information for each dog', async () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Owned by John D.')).toBeInTheDocument()
      expect(screen.getByText('Owned by Jane S.')).toBeInTheDocument()
    })
  })

  it('displays dog size and temperament information', async () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText(/large/i)).toBeInTheDocument()
      expect(screen.getByText(/medium/i)).toBeInTheDocument()
      expect(screen.getByText(/friendly/i)).toBeInTheDocument()
      expect(screen.getByText(/energetic/i)).toBeInTheDocument()
    })
  })

  it('calls onDogSelect when a dog card is clicked', async () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    const buddyCard = screen.getByText('Buddy').closest('[data-testid="dog-card"]')
    expect(buddyCard).toBeInTheDocument()

    fireEvent.click(buddyCard!)

    expect(mockOnDogSelect).toHaveBeenCalledWith(mockDogs[0])
  })

  it('shows empty state when no dogs are found', async () => {
    // Mock empty response
    mockSupabaseQuery.mockResolvedValue({
      data: [],
      error: null
    })

    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText(/no dogs found/i)).toBeInTheDocument()
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument()
    })
  })

  it('handles error state gracefully', async () => {
    // Mock error response
    mockSupabaseQuery.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText(/error loading dogs/i)).toBeInTheDocument()
      expect(screen.getByText(/please try again/i)).toBeInTheDocument()
    })
  })

  it('shows retry button in error state and allows retry', async () => {
    // Mock initial error
    mockSupabaseQuery.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText(/error loading dogs/i)).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()

    // Mock successful retry
    mockSupabaseQuery.mockResolvedValue({
      data: mockDogs,
      error: null
    })

    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })
  })

  it('displays dog bios when available', async () => {
    render(<DogBrowseList onDogSelect={mockOnDogSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Loves playing fetch and swimming')).toBeInTheDocument()
      expect(screen.getByText('Very active and loves agility training')).toBeInTheDocument()
    })
  })
})