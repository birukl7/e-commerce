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
                  className="prose prose-lg max-w-none text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-em:text-gray-800 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
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