import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import Footer from "@/components/footer"

function TermsContent() {
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Pricing and Payment</h2>
                <p className="text-gray-700 mb-4">
                  All prices are in Ethiopian Birr (ETB) unless otherwise stated. Payment must be made at the time of purchase. 
                  We reserve the right to modify prices at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Shipping and Delivery</h2>
                <p className="text-gray-700 mb-4">
                  Delivery times may vary depending on your location and the type of product. 
                  We will provide estimated delivery times at checkout.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Returns and Refunds</h2>
                <p className="text-gray-700 mb-4">
                  Returns are accepted within 14 days of delivery for most items. 
                  Some products may have different return policies as specified in the product description.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
                <p className="text-gray-700 mb-4">
                  All content on this website, including text, graphics, logos, and images, 
                  is the property of ShopHub Ethiopia and is protected by Ethiopian and international copyright laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  ShopHub Ethiopia shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages resulting from your use of the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
                <p className="text-gray-700 mb-4">
                  These terms shall be governed by and construed in accordance with the laws of Ethiopia. 
                  Any disputes shall be resolved in the courts of Ethiopia.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
                <p className="text-gray-700 mb-4">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately 
                  upon posting on the website. Your continued use of the service constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}

export default function Terms() {
  return (
    <CartProvider>
      <TermsContent />
    </CartProvider>
  )
} 