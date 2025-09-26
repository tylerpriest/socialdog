import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Navigation } from '@/components/Navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function RegisterPage() {
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
              Join SocialDog
            </h2>
            <p className="text-gray-600">
              Create your account and find perfect playmates for your dog
            </p>
          </div>

          {/* Register Form Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-white/20">
            <RegisterForm />
          </div>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Visual Element */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src="/images/dogs-playing.jpg"
                  alt="Dogs playing"
                  width={24}
                  height={24}
                  className="object-cover w-full h-full"
                />
              </div>
              <span>Free to join • Connect with local dog owners</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}