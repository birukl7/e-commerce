import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import Footer from "@/components/footer"

interface TermsProps {
  settings?: {
    terms_conditions_content?: string;
  };
}

function TermsContent({ settings }: TermsProps) {
  return (
    <>
      <Head title="Terms and Conditions - ShopHub">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
              
              {settings?.terms_conditions_content ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: settings.terms_conditions_content }}
                />
              ) : (
                <>
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-700 mb-4">
                      By accessing and using ShopHub Ethiopia ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                    <p className="text-gray-700 mb-4">
                      ShopHub is an Ethiopian e-commerce platform that connects buyers with sellers of traditional Ethiopian crafts, 
                      modern products, and authentic Ethiopian goods including coffee, textiles, and artwork.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                    <p className="text-gray-700 mb-4">
                      You are responsible for maintaining the confidentiality of your account and password. 
                      You agree to accept responsibility for all activities that occur under your account.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Information</h2>
                    <p className="text-gray-700 mb-4">
                      While we strive to provide accurate product information, we do not warrant that product descriptions, 
                      prices, or other content is accurate, complete, reliable, current, or error-free.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Information</h2>
                    <p className="text-gray-700 mb-4">
                      If you have any questions about these Terms and Conditions, please contact us at:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>ShopHub Ethiopia</strong><br />
                        Email: support@shophub.et<br />
                        Phone: +251 911 123 456<br />
                        Address: Addis Ababa, Ethiopia
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

export default function Terms({ settings }: TermsProps) {
  return (
    <CartProvider>
      <TermsContent settings={settings} />
    </CartProvider>
  )
} 