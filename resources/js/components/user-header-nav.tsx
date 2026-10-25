import { Link, usePage } from "@inertiajs/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { SharedData } from "@/types";

interface UserHeaderNavProps {
  activeTab: "dashboard" | "wishlist" | "orders" | "requests" | "products" | "settings";
}

export function UserHeaderNav({ activeTab }: UserHeaderNavProps) {
  const { t } = useTranslation();
  const page = usePage<SharedData>();
  const user = page.props.auth?.user;

  const tabs: Array<{
    id: "dashboard" | "wishlist" | "orders" | "requests" | "products" | "settings";
    title: string;
    href: string;
  }> = [
    {
      id: "dashboard",
      title: t("header.dashboard") || "Dashboard",
      href: "/dashboard",
    },
    {
      id: "wishlist",
      title: t("header.bookmarkedProducts") || "Bookmarked Products",
      href: "/user-wishlist",
    },
    {
      id: "orders",
      title: t("header.orders") || "Orders",
      href: "/user-order",
    },
    {
      id: "requests",
      title: t("header.requests") || "Requests",
      href: "/user-request",
    },
    {
      id: "products",
      title: t("header.boughtProducts") || "Bought Products",
      href: "/user-products",
    },
    {
      id: "settings",
      title: t("header.settings") || "Settings",
      href: "/settings/profile",
    },
  ];

  return (
    <div className="bg-white border-b border-neutral-200 sticky top-[64px] z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-1 sm:space-x-8 overflow-x-auto no-scrollbar py-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative py-3.5 px-3 sm:px-1 text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "text-neutral-900 font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>{tab.title}</span>
                {/* Active Underline ::after style */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-neutral-900 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default UserHeaderNav;
