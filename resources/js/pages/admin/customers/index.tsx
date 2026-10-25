/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import { ArrowUpRight, CheckCircle2, Eye, Search, ShieldCheck, Trash2, Users, UserCheck, X } from 'lucide-react'
import { useEffect, useState } from "react"
import { adminNavItems } from "@/constants/adminNavItems"

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  status: 'active' | 'inactive' | 'banned'
  email_verified_at?: string
  created_at: string
  orders_count?: number
  wishlists_count?: number
  is_supplier?: boolean
}

interface PaginatedCustomers {
  data: Customer[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  links?: Array<{ url?: string; label: string; active: boolean }>
}

interface Props {
  customers: PaginatedCustomers
  filters: {
    search?: string
    status?: string
    type?: string
  }
  type: 'customers' | 'suppliers'
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin-dashboard",
  },
  {
    title: "Customers & Accounts",
    href: "/admin/customers",
  },
]

export default function CustomersIndex({ customers, filters, type }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [currentType, setCurrentType] = useState(type || 'customers')
  const [primaryColor, setPrimaryColor] = useState<string>('#1E5338')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('serdo_dashboard_primary_color')
      if (saved) setPrimaryColor(saved)
    } catch {
      // Ignore
    }

    const handleThemeChange = (e: any) => {
      const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
      if (color) setPrimaryColor(color);
    }
    window.addEventListener('serdo:theme-color-changed', handleThemeChange)
    return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange)
  }, [])

  const handleDelete = (customer: Customer) => {
    const entityType = currentType === 'customers' ? 'customer' : 'supplier'
    if (confirm(`Are you sure you want to delete this ${entityType}?`)) {
      router.delete(`/admin/customers/${customer.id}`)
    }
  }

  const handleSearch = () => {
    router.get(
      '/admin/customers',
      {
        search: searchTerm,
        type: currentType,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    )
  }

  const handleTypeChange = (newType: 'customers' | 'suppliers') => {
    setCurrentType(newType)
    router.get(
      '/admin/customers',
      {
        type: newType,
        search: searchTerm,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    )
  }

  const getCustomerAvatarColor = (name: string) => {
    const list = [
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-rose-100 text-rose-800 border-rose-200',
    ]
    return list[(name || 'U').charCodeAt(0) % list.length]
  }

  const activeCount = customers.data.filter(c => c.status === 'active').length
  const verifiedCount = customers.data.filter(c => c.email_verified_at).length

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title={`${currentType === 'customers' ? 'Customers' : 'Suppliers'} Management | Donezo Style`} />

      <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto space-y-6">

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 capitalize">
                  {currentType === 'customers' ? 'Registered Customers' : 'Authorized Suppliers'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <ShieldCheck className="w-3 h-3 text-neutral-500" />
                  {customers.total} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
                {currentType === 'customers'
                  ? 'Manage user accounts, check purchase activity, and review verification statuses.'
                  : 'Manage store vendor partnerships, contact profiles, and wholesale privileges.'}
              </p>
            </div>
          </div>

          {/* Metric Strip (Donezo 4-Card Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Primary Accent */}
            <div
              className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-white/80">Total {currentType === 'customers' ? 'Customers' : 'Suppliers'}</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <ArrowUpRight className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {customers.total}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium text-white backdrop-blur-xs">
                  <Users className="w-3 h-3" />
                  <span>Enrolled platform accounts</span>
                </div>
              </div>
            </div>

            {/* Card 2: Active Accounts */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Active Status</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {activeCount}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Unrestricted account status</span>
                </div>
              </div>
            </div>

            {/* Card 3: Email Verified */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Verified Email</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {verifiedCount}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Confirmed auth credential</span>
                </div>
              </div>
            </div>

            {/* Card 4: Current Page Count */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Visible Page</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {customers.data.length}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                  <span>Page {customers.current_page} of {customers.last_page}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Switcher & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Pill Switcher */}
            <div className="inline-flex items-center bg-white p-1 rounded-full border border-neutral-200/80 shadow-xs">
              <button
                onClick={() => handleTypeChange('customers')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  currentType === 'customers' ? 'text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
                style={currentType === 'customers' ? { backgroundColor: primaryColor } : {}}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
              </button>

              <button
                onClick={() => handleTypeChange('suppliers')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  currentType === 'suppliers' ? 'text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
                style={currentType === 'suppliers' ? { backgroundColor: primaryColor } : {}}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Suppliers</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={`Search ${currentType} by name or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-20 rounded-full border-neutral-200/80 text-xs py-2 bg-white"
              />
              <button
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-900 text-white text-[11px] font-semibold rounded-full hover:bg-neutral-800 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5">Name & Profile</th>
                    <th className="py-3.5 px-4">Contact Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Account Type</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Verified</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {customers.data.map((c) => {
                    const avatar = getCustomerAvatarColor(c.name || '')
                    return (
                      <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors group">
                        {/* Name & Avatar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${avatar} border flex items-center justify-center font-bold text-xs shrink-0`}>
                              {(c.name || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-neutral-900 text-xs">
                              {c.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 text-neutral-600">
                          {c.email}
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 text-neutral-600">
                          {c.phone || '—'}
                        </td>

                        {/* Account Type */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.is_supplier
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}>
                            {c.is_supplier ? 'Supplier' : 'Customer'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}>
                            {c.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span className="capitalize">{c.status}</span>
                          </span>
                        </td>

                        {/* Verified */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.email_verified_at
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {c.email_verified_at ? 'Verified' : 'Unverified'}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 text-neutral-400 text-[11px]">
                          {new Date(c.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/customers/${c.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-[11px] font-semibold shadow-xs transition-all active:scale-95"
                            >
                              <Eye className="w-3 h-3 text-neutral-500" />
                              <span>View</span>
                            </Link>

                            <button
                              onClick={() => handleDelete(c)}
                              className="p-1.5 rounded-full border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 text-neutral-400 hover:text-rose-600 transition-colors"
                              title="Delete account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {customers.data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-neutral-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold text-neutral-700">No {currentType} found</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Try modifying your search query.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customers.links && customers.links.length > 3 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
                <span className="text-xs text-neutral-400 font-medium">
                  Showing <strong className="text-neutral-700">{customers.from}</strong> to{' '}
                  <strong className="text-neutral-700">{customers.to}</strong> of{' '}
                  <strong className="text-neutral-700">{customers.total}</strong> accounts
                </span>

                <div className="flex items-center gap-1.5">
                  {customers.links.map((link, idx) => {
                    const label = link.label
                      .replace('&laquo; Previous', 'Prev')
                      .replace('Next &raquo;', 'Next')

                    return (
                      <button
                        key={idx}
                        onClick={() => link.url && router.visit(link.url)}
                        disabled={!link.url}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          link.active
                            ? 'text-white shadow-xs'
                            : link.url
                            ? 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                            : 'bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200/50'
                        }`}
                        style={link.active ? { backgroundColor: primaryColor } : {}}
                        dangerouslySetInnerHTML={{ __html: label }}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
