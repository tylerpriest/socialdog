import { LoginForm } from '@/features/auth/components/LoginForm'
import { Navigation } from '@/components/Navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navigation variant="public" />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 mb-4">
              <Image
                src="/socialdog-logo.png"
                alt="SocialDog"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to connect with dog owners in your area
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-white/20">
            <LoginForm />

            {/* Guest Experience Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Guest Experience Includes:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Browse all dog profiles</li>
                <li>✓ View user profiles and photos</li>
                <li>✓ Explore your local dog community</li>
                <li className="text-gray-400">⚡ Create dog profiles (requires account)</li>
                <li className="text-gray-400">⚡ Message other users (requires account)</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Guest sessions last 24 hours. Upgrade anytime to save your progress!
              </p>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Visual Element */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src="/images/hero-beach-dogs.jpg"
                  alt="Happy dogs"
                  width={24}
                  height={24}
                  className="object-cover w-full h-full"
                />
              </div>
              <span>Join our community of dog lovers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}