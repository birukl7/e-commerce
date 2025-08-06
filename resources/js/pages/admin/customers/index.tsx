import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import { Edit, Eye, Plus, Search, Trash2, Users } from 'lucide-react'
import { useState } from "react"
import { adminNavItems } from "../dashboard"

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
}

interface PaginatedCustomers {
  data: Customer[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface Props {
  customers: PaginatedCustomers
  filters: {
    search?: string
    status?: string
  }
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
  },
  {
    title: "Customers",
    href: "/admin/customers",
  },
]

export default function CustomersIndex({ customers, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "")

  const handleDelete = (customerId: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      router.delete(`/admin/customers/${customerId}`)
    }
  }

  const handleSearch = () => {
    router.get('/admin/customers', { search: searchTerm }, { 
      preserveState: true,
      replace: true 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Customers Management" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto font-sans">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
            <p className="text-muted-foreground">Manage your customer accounts and information</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{customers.total}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {customers.data.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {customers.data.filter(c => c.email_verified_at).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Page</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{customers.data.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Search Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Customer List</CardTitle>
            <CardDescription>
              Showing {customers.from} to {customers.to} of {customers.total} customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Name</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Email</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Phone</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Verified</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Orders</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">Joined</th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.data.map((customer) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 font-medium">{customer.name}</td>
                      <td className="p-4">{customer.email}</td>
                      <td className="p-4">{customer.phone || 'N/A'}</td>
                      <td className="p-4">{getStatusBadge(customer.status)}</td>
                      <td className="p-4">
                        {customer.email_verified_at ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                      </td>
                      <td className="p-4">{customer.orders_count || 0}</td>
                      <td className="p-4">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customers.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {customers.current_page} of {customers.last_page}
                </div>
                <div className="flex gap-2">
                  {customers.current_page > 1 && (
                    <Link href={`/admin/customers?page=${customers.current_page - 1}`}>
                      <Button variant="outline" size="sm">Previous</Button>
                    </Link>
                  )}
                  {customers.current_page < customers.last_page && (
                    <Link href={`/admin/customers?page=${customers.current_page + 1}`}>
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
