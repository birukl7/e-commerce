import Footer from "@/components/footer";
import Header from "@/components/header";
import { Head } from "@inertiajs/react";
import React, { ReactNode } from "react"
import { CartProvider } from "@/contexts/cart-context"

type MainLayout = {
  children: ReactNode;
  title: string;
  className: string
}

const MainLayout: React.FC<MainLayout> = ({children, title , className}) => {
  return (
    <CartProvider>
      <div className={' ' + className}>
        <Head title={title}>
        </Head>
        <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          {/* Header */}
          <Header />
          {children}
          <Footer />
        </div>
      </div>
    </CartProvider>
  )
}

export default MainLayout
