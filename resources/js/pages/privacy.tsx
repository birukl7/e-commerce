import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import Footer from "@/components/footer"
import { useTranslation } from "react-i18next"

interface PrivacyProps {
  settings?: {
    privacy_policy_content?: string;
  };
}

function PrivacyContent({ settings }: PrivacyProps) {
  const { t } = useTranslation()
  
  return (
    <>
      <Head title={`${t('privacy.title')} - ShopHub`}>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('privacy.title')}</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">{t('privacy.lastUpdated')} {new Date().toLocaleDateString()}</p>
              
              {settings?.privacy_policy_content ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: settings.privacy_policy_content }}
                />
              ) : (
                <>
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.informationWeCollect')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('privacy.informationWeCollectDesc')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>{t('privacy.nameEmailPhone')}</li>
                      <li>{t('privacy.billingShipping')}</li>
                      <li>{t('privacy.paymentInfo')}</li>
                      <li>{t('privacy.orderHistory')}</li>
                      <li>{t('privacy.communications')}</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.howWeUse')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('privacy.howWeUseDesc')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>{t('privacy.processOrders')}</li>
                      <li>{t('privacy.communicate')}</li>
                      <li>{t('privacy.marketing')}</li>
                      <li>{t('privacy.improve')}</li>
                      <li>{t('privacy.protect')}</li>
                      <li>{t('privacy.comply')}</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.informationSharing')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('privacy.informationSharingDesc')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>{t('privacy.withConsent')}</li>
                      <li>{t('privacy.processPayments')}</li>
                      <li>{t('privacy.fulfillOrders')}</li>
                      <li>{t('privacy.legalRequirements')}</li>
                      <li>{t('privacy.protectRights')}</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.dataSecurity')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('privacy.dataSecurityDesc')}
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('privacy.contactUs')}</h2>
                    <p className="text-gray-700 mb-4">
                      {t('privacy.contactUsDesc')}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>{t('privacy.shopHubEthiopia')}</strong><br />
                        {t('privacy.email')} privacy@shophub.et<br />
                        {t('privacy.phone')} +251 911 123 456<br />
                        {t('privacy.address')} Addis Ababa, Ethiopia<br />
                        {t('privacy.dataProtectionOfficer')} dpo@shophub.et
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