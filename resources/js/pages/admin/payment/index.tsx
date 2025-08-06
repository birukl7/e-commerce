import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import { CreditCard, DollarSign, Download, Eye, Filter, Search, TrendingDown, TrendingUp, Calendar, Users } from 'lucide-react'
import { useState } from "react"
import { adminNavItems } from "../dashboard"

interface PaymentTransaction {
  id: number
  tx_ref: string
  order_id: string
  amount: number
  currency: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  payment_method: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  customer_id?: number
  order_total?: number
  order_status?: string
}

interface PaymentStats {
  total_transactions: number
  successful_payments: number
  failed_payments: number
  pending_payments: number
  total_revenue: number
  today_revenue: number
}

interface PaginatedPayments {
  data: PaymentTransaction[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface Props {
  payments: PaginatedPayments
  stats: PaymentStats
  filters: {
    search?: string
    status?: string
    payment_method?: string
    date_from?: string
    date_to?: string
  }
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin-dashboard",
  },
  {
    title: "Payments",
    href: "/admin/payments",
  },
]

export default function PaymentsIndex({ payments, stats, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [statusFilter, setStatusFilter] = useState(filters.status || "")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || "")
  const [dateFrom, setDateFrom] = useState(filters.date_from || "")
  const [dateTo, setDateTo] = useState(filters.date_to || "")

  const handleSearch = () => {
    router.get('/admin/payments', { 
      search: searchTerm,
      status: statusFilter,
      payment_method: paymentMethodFilter,
      date_from: dateFrom,
      date_to: dateTo
    }, { 
      preserveState: true,
      replace: true 
    })
  }

  const handleExport = () => {
    window.location.href = `/admin/payments/export?${new URLSearchParams({
      status: statusFilter,
      payment_method: paymentMethodFilter,
      date_from: dateFrom,
      date_to: dateTo
    }).toString()}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'telebirr':
        return <Badge className="bg-purple-100 text-purple-800">Telebirr</Badge>
      case 'cbe':
        return <Badge className="bg-blue-100 text-blue-800">CBE</Badge>
      case 'paypal':
        return <Badge className="bg-indigo-100 text-indigo-800">PayPal</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const formatPrice = (amount: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Payment Summaries" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto font-sans">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Summaries</h1>
            <p className="text-muted-foreground">Monitor and manage all payment transactions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatPrice(stats.total_revenue)}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Today: {formatPrice(stats.today_revenue)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total_transactions}</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total_transactions > 0 
                  ? Math.round((stats.successful_payments / stats.total_transactions) * 100)
                  : 0}%
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">{stats.successful_payments} successful</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failed_payments}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Pending: {stats.pending_payments}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Methods</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="cbe">CBE</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Transactions</CardTitle>
            <CardDescription>
              Showing {payments.from} to {payments.to} of {payments.total} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Transaction</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Customer</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Method</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Date</th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.data.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{payment.tx_ref}</p>
                          <p className="text-xs text-muted-foreground">Order: {payment.order_id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{payment.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{payment.customer_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{formatPrice(payment.amount, payment.currency)}</p>
                      </td>
                      <td className="p-4">
                        {getPaymentMethodBadge(payment.payment_method)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/payments/${payment.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {payments.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {payments.current_page} of {payments.last_page}
                </div>
                <div className="flex gap-2">
                  {payments.current_page > 1 && (
                    <Link href={`/admin/payments?page=${payments.current_page - 1}`}>
                      <Button variant="outline" size="sm">Previous</Button>
                    </Link>
                  )}
                  {payments.current_page < payments.last_page && (
                    <Link href={`/admin/payments?page=${payments.current_page + 1}`}>
                      <Button variant="outline" size="sm">Next</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
