'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { useState } from 'react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [comments, setComments] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', { email, firstName, lastName, comments })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation variant="public" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Socialising<br />
              and education<br />
              made fun
            </h1>

            {/* Mobile Phone Mockups */}
            <div className="flex justify-center items-center gap-4 mb-12">
              <div className="relative">
                <div className="w-40 h-80 md:w-48 md:h-96 bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    <Image
                      src="/images/hero-beach-dogs.jpg"
                      alt="Dog Profile"
                      width={200}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="relative -ml-8 z-10">
                <div className="w-40 h-80 md:w-48 md:h-96 bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    <Image
                      src="/images/dogs-playing.jpg"
                      alt="Dog Socializing"
                      width={200}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/auth/register"
                className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Sign Up / Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is SocialDog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What is Socialdog?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Socialdog is a platform that connects dogs & dog owners around the area while helping you socialise your dog correctly.
              </p>
              <p>
                After uploading a detailed profile of your dog - that includes temperamental and behaviour questions - you will be able to see other dogs in the area that could be compatible with your pooch.
              </p>
              <p>
                Generally dogs enjoy the company of other dogs, however, just like humans, not all dogs get along.
              </p>
              <p>
                Socialdog will educate you to find the perfect match for your furry friend, help you understand how to socialise your dog properly while also helping you to create a community of dog lovers around you that you can trust.
              </p>

              <div className="pt-6">
                <Link
                  href="/auth/register"
                  className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Sign up now!
                </Link>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/images/three-dogs-field.jpg"
                alt="A meeting spot for dogs"
                width={500}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-gray-800">A meeting spot for dogs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Platform Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/images/hero-beach-dogs.jpg"
                alt="Help your best friend make more best friends"
                width={500}
                height={400}
                className="rounded-lg w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Help your best friend make more best friends</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-pink-400">Make Socialising A Walk In The Park</span>
              </h2>

              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Socialdog offers more than a way to connect you and your doggie with other dog lovers. Created by dog specialists - a dog trainer and a veterinarian - the platform will provide guidance on how to find the best pawmate for your dog and the best practices to succeed in each meeting, along with lots of more info about correct socialisation.
                </p>
                <p>
                  Socialdog is an ongoing educational platform that will create a safer community for you and your dog, aiming to reduce reactivity, aggression and dog attacks.
                </p>
              </div>

              <Link
                href="/auth/register"
                className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Start here!
              </Link>
            </div>
          </div>

          {/* Video Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">
              Watch our video 🐾
            </h3>
            <div className="max-w-2xl mx-auto">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-gray-300">Video coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Join Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to join our<br />pawsome community?
              </h2>
              <Link
                href="/auth/register"
                className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Sign up now!
              </Link>
            </div>

            <div className="relative">
              <Image
                src="/images/dogs-playing.jpg"
                alt="Fur-ever friends for your dog"
                width={400}
                height={300}
                className="rounded-lg w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Fur-ever friends for your dog</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & Footer Section */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Signup */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6 text-center">
              Subscribe to our newsletter to get all the news from the SocialDog world!
            </h3>

            <form onSubmit={handleNewsletterSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First name*</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Any comments or questions you have for the SocialDog team?
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <p className="text-sm text-gray-400">
                Note: you are signing up to our newsletter, not to our platform. Is this OK? If you want to sign up to our platform, please use the buttons that say "sign up" throughout the website.
              </p>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-800 pt-8">
            <div className="text-center space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Get in touch!</h4>
                <a href="mailto:info@socialdog.co.nz" className="text-purple-400 hover:text-purple-300">
                  info@socialdog.co.nz
                </a>
              </div>

              <div className="flex justify-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  YouTube
                </a>
              </div>

              <p className="text-gray-400 text-sm">
                ©2023 Socialdog LTD - all rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}