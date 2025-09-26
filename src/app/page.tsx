import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🐕</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">SocialDog</h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Connect with Local{' '}
            <span className="text-purple-600">Dog Owners</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find the perfect playmates for your furry friend in your neighbourhood.
            Build lasting friendships with fellow dog lovers and create amazing adventures together.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/auth/register"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🐕</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Dog Profiles
              </h3>
              <p className="text-gray-600">
                Showcase your dog's personality, breed, and favorite activities to help find perfect playmates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎾</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Find Local Playmates
              </h3>
              <p className="text-gray-600">
                Discover dogs in your area that match your pet's size, energy level, and temperament.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect & Message
              </h3>
              <p className="text-gray-600">
                Chat with other dog owners, coordinate playdates, and build a community of dog lovers.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-4">
              Join our growing community of dog lovers
            </p>
            <div className="flex justify-center items-center space-x-8 text-gray-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">120+</div>
                <div className="text-sm">Dog Owners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">200+</div>
                <div className="text-sm">Dog Profiles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">500+</div>
                <div className="text-sm">Playdates</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🐕</span>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">SocialDog</span>
            </div>

            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-purple-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-purple-600">
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
            <p>&copy; 2024 SocialDog. Connecting dog owners in New Zealand.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
