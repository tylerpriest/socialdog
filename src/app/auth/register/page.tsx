import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Navigation } from '@/components/Navigation'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="public" />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Join SocialDog
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Create your account and find perfect playmates for your dog
            </p>
          </div>
          <RegisterForm />
          <div className="text-center">
            <a href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}