import { Navigation } from '@/components/Navigation'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="public" />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose max-w-none">
              <p className="text-sm text-gray-500 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                  SocialDog ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your information when you use our social
                  networking platform for dog owners.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-700 mb-4">
                  When you register for SocialDog, we may collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Profile information (bio, location, profile picture)</li>
                  <li>Account credentials (username, password)</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-3">Dog Information</h3>
                <p className="text-gray-700 mb-4">
                  Information about your dog(s) including:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Dog's name, breed, age, gender, and size</li>
                  <li>Temperament and behavior information</li>
                  <li>Photos and descriptions</li>
                  <li>Vaccination status and health information (optional)</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mb-3">Usage Information</h3>
                <p className="text-gray-700 mb-4">
                  We automatically collect certain information when you use our Service:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>Location data (with your permission)</li>
                  <li>Communication data (messages sent through our platform)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Provide and maintain our Service</li>
                  <li>Create and manage your account and dog profiles</li>
                  <li>Connect you with other dog owners in your area</li>
                  <li>Send you notifications and updates</li>
                  <li>Improve our Service and develop new features</li>
                  <li>Ensure safety and prevent misuse of our platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>With other users as part of the social networking features (profile information, dog information)</li>
                  <li>With service providers who assist us in operating our platform</li>
                  <li>When required by law or to protect our rights and safety</li>
                  <li>In connection with a business transfer or merger</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Location Information</h2>
                <p className="text-gray-700 mb-4">
                  With your permission, we may collect and use your location information to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Show you dog owners and dogs in your area</li>
                  <li>Suggest nearby dog parks and pet-friendly locations</li>
                  <li>Facilitate local meetups and playdates</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  You can disable location sharing at any time through your device settings or account preferences.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                <p className="text-gray-700 mb-4">
                  We retain your personal information for as long as your account is active or as needed to provide
                  you services. We may also retain and use your information as necessary to comply with legal
                  obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Privacy Rights</h2>
                <p className="text-gray-700 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Access, update, or delete your personal information</li>
                  <li>Control the visibility of your profile and dog information</li>
                  <li>Opt-out of certain communications</li>
                  <li>Export your data in a portable format</li>
                  <li>Request deletion of your account and associated data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-700 mb-4">
                  Our Service is not intended for children under 13. We do not knowingly collect personal
                  information from children under 13. If you are a parent or guardian and believe your child
                  has provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Third-Party Services</h2>
                <p className="text-gray-700 mb-4">
                  Our Service may contain links to third-party websites or integrate with third-party services.
                  We are not responsible for the privacy practices of these third parties. We encourage you to
                  review their privacy policies before providing any personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
                <p className="text-gray-700 mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure
                  that such transfers are conducted in accordance with applicable data protection laws and
                  appropriate safeguards are in place.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                  the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to
                  review this Privacy Policy periodically.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <p className="text-gray-700">
                  Email: privacy@socialdog.co.nz<br />
                  Website: www.socialdog.co.nz<br />
                  Address: Auckland, New Zealand
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using SocialDog, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}