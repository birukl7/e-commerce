import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTable, TableColumn, TableAction, createStatusColumn, createDateColumn, createBooleanColumn } from "@/components/ui/data-table"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import { Edit, Eye, Plus, Search, Trash2, Users } from 'lucide-react'
import { useState } from "react"
import { adminNavItems } from "../dashboard"
import H1 from "@/components/ui/h1"

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
    type?: string
  }
  type: 'customers' | 'suppliers'
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

export default function CustomersIndex({ customers, filters, type }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [currentType, setCurrentType] = useState(type || 'customers')

  const handleDelete = (customer: Customer) => {
    const entityType = currentType === 'customers' ? 'customer' : 'supplier'
    if (confirm(`Are you sure you want to delete this ${entityType}?`)) {
      router.delete(`/admin/customers/${customer.id}`)
    }
  }

  // Define table columns
  const columns: TableColumn<Customer>[] = [
    {
      key: 'name',
      title: 'Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'email',
      title: 'Email'
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => value || 'N/A'
    },
    createStatusColumn<Customer>('status', 'Status'),
    {
      key: 'email_verified_at',
      title: 'Verified',
      render: (value) => (
        <Badge className={value ? "bg-green-100 text-green-800" : ""} variant={value ? "default" : "secondary"}>
          {value ? "Verified" : "Unverified"}
        </Badge>
      )
    },
    {
      key: 'orders_count',
      title: 'Orders',
      render: (value) => value || 0
    },
    createDateColumn<Customer>('created_at', 'Joined')
  ]

  // Define table actions
  const getActions = (customer: Customer): TableAction<Customer>[] => [
    {
      label: '',
      href: `/admin/customers/${customer.id}`,
      icon: <Eye className="h-4 w-4" />,
      variant: 'outline',
      size: 'sm'
    },
    {
      label: '',
      onClick: () => handleDelete(customer),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'outline',
      size: 'sm',
      className: 'text-destructive hover:text-destructive'
    }
  ]

  const handleSearch = () => {
    router.get('/admin/customers', { 
      search: searchTerm,
      type: currentType 
    }, { 
      preserveState: true,
      replace: true 
    })
  }

  const handleTypeChange = (newType: 'customers' | 'suppliers') => {
    setCurrentType(newType)
    router.get('/admin/customers', { 
      type: newType,
      search: searchTerm 
    }, { 
      preserveState: true,
      replace: true 
    })
  }



  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title={`${currentType === 'customers' ? 'Customers' : 'Suppliers'} Management`} />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto font-sans mx-auto max-w-7xl"> 
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <H1 className="">
              {currentType === 'customers' ? 'Customers' : 'Suppliers'}
            </H1>
            <p className="text-muted-foreground">
              {currentType === 'customers' 
                ? 'Manage your customer accounts and information'
                : 'Manage your supplier accounts and information'
              }
            </p>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleTypeChange('customers')}
            className={`hover:cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentType === 'customers'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => handleTypeChange('suppliers')}
            className={`hover:cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentType === 'suppliers'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Suppliers
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total {currentType === 'customers' ? 'Customers' : 'Suppliers'}
              </CardTitle>
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
            <CardTitle className="text-lg font-semibold">
              Search {currentType === 'customers' ? 'Customers' : 'Suppliers'}
            </CardTitle>
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

        {/* Customers/Suppliers Table */}
        <DataTable<Customer>
          data={customers.data}
          columns={columns}
          title={`${currentType === 'customers' ? 'Customer' : 'Supplier'} List`}
          description={`Showing ${customers.from} to ${customers.to} of ${customers.total} ${currentType}`}
          actions={getActions}
          pagination={customers}
          baseUrl="/admin/customers"
          emptyMessage={`No ${currentType} found.`}
        />
      </div>
    </AppLayout>
  )
}
