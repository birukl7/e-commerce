import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import Footer from "@/components/footer"

interface PrivacyProps {
  settings?: {
    privacy_policy_content?: string;
  };
}

function PrivacyContent({ settings }: PrivacyProps) {
  return (
    <>
      <Head title="Privacy Policy - ShopHub">
      </Head>
      
      <div
        className="min-h-screen bg-white text-slate-900"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
              
              {settings?.privacy_policy_content ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: settings.privacy_policy_content }}
                />
              ) : (
                <>
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                    <p className="text-gray-700 mb-4">
                      We collect information you provide directly to us, such as when you create an account, 
                      make a purchase, or contact us for support. This may include:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>Name, email address, and phone number</li>
                      <li>Billing and shipping addresses</li>
                      <li>Payment information (processed securely through our payment partners)</li>
                      <li>Order history and preferences</li>
                      <li>Communications with our customer service team</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-700 mb-4">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>Process your orders and payments</li>
                      <li>Communicate with you about your orders and account</li>
                      <li>Send you marketing communications (with your consent)</li>
                      <li>Improve our services and develop new features</li>
                      <li>Protect against fraud and ensure security</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                    <p className="text-gray-700 mb-4">
                      We do not sell, trade, or otherwise transfer your personal information to third parties, 
                      except in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>With your explicit consent</li>
                      <li>To process payments (payment processors)</li>
                      <li>To fulfill orders (shipping partners)</li>
                      <li>To comply with legal requirements</li>
                      <li>To protect our rights and safety</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                    <p className="text-gray-700 mb-4">
                      We implement appropriate technical and organizational measures to protect your personal information 
                      against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                      over the internet is 100% secure.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
                    <p className="text-gray-700 mb-4">
                      If you have any questions about this privacy policy or our data practices, please contact us at:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>ShopHub Ethiopia</strong><br />
                        Email: privacy@shophub.et<br />
                        Phone: +251 911 123 456<br />
                        Address: Addis Ababa, Ethiopia<br />
                        Data Protection Officer: dpo@shophub.et
                      </p>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}

export default function Privacy({ settings }: PrivacyProps) {
  return (
    <CartProvider>
      <PrivacyContent settings={settings} />
    </CartProvider>
  )
} 