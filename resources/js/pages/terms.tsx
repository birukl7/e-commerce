import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import Footer from "@/components/footer"
import { useTranslation } from "react-i18next"

interface TermsProps {
  settings?: {
    terms_conditions_content?: string;
  };
}

function TermsContent({ settings }: TermsProps) {
  const { t } = useTranslation()
  
  return (
    <>
      <Head title={`${t('terms.title')} - Serdo`}>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('terms.title')}</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">{t('terms.lastUpdated')} {new Date().toLocaleDateString()}</p>
              
              {settings?.terms_conditions_content ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: settings.terms_conditions_content }}
                />
              ) : (
                <>
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('terms.acceptanceOfTerms')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('terms.acceptanceOfTermsDesc')}
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('terms.descriptionOfService')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('terms.descriptionOfServiceDesc')}
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('terms.userAccounts')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('terms.userAccountsDesc')}
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('terms.productInformation')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('terms.productInformationDesc')}
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('terms.contactInformation')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('terms.contactInformationDesc')}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>Serdo PLC Ethiopia</strong><br />
                        {t('terms.supportEmail')} support@serdo.et<br />
                        {t('terms.supportPhone')} +251 911 123 456<br />
                        {t('terms.supportAddress')} Addis Ababa, Ethiopia
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