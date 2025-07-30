import Footer from "@/components/footer";
import Header from "@/components/header";
import { Head } from "@inertiajs/react";
import React, { ReactNode } from "react"
import { CartProvider } from "@/contexts/cart-context"

type MainLayout = {
  children: ReactNode;
  title: string;
  className: string;
  footerOff?: boolean;
  contentMarginTop?: string;
}

const MainLayout: React.FC<MainLayout> = ({children, title , className, footerOff, contentMarginTop }) => {
  return (
    <CartProvider>
      <div className={' ' + className}>
        <Head title={title}>
        </Head>
        <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
          {/* Header */}
          <>
          
          </>
          <Header />
          <div className={"  max-w-[1280px] mx-auto " + contentMarginTop}>
            {children}
          </div>

          <div>
            {
              footerOff ? <Footer/> : <></>
            }
          </div>
        </div>
      </div>
    </CartProvider>
  )
}

export default MainLayout
