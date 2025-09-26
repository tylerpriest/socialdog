import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth endpoints
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: '123',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString()
      }
    })
  }),

  // API endpoints
  http.get('/api/dogs', () => {
    return HttpResponse.json({
      dogs: [
        {
          id: '1',
          name: 'Max',
          breed: 'Golden Retriever',
          age: 2,
          size: 'large',
          photos: ['max1.jpg'],
          owner: { name: 'John', location: 'Auckland' }
        }
      ]
    })
  }),

  http.post('/api/dogs', async ({ request }) => {
    const newDog = await request.json()
    return HttpResponse.json({
      dog: {
        id: '2',
        ...newDog
      }
    }, { status: 201 })
  }),

  // User profiles
  http.get('/api/profiles/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      location: 'Auckland',
      createdAt: new Date().toISOString()
    })
  })
]