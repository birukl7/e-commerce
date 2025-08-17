import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "@inertiajs/react"
import { ReactNode } from "react"

export interface TableColumn<T = any> {
  key: string
  title: string
  render?: (value: any, record: T, index: number) => ReactNode
  className?: string
  sortable?: boolean
}

export interface TableAction<T = any> {
  label: string
  href?: string
  onClick?: (record: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: ReactNode
  className?: string
}

export interface PaginationInfo {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface DataTableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  title?: string
  description?: string
  actions?: TableAction<T>[] | ((record: T) => TableAction<T>[])
  pagination?: PaginationInfo
  baseUrl?: string
  loading?: boolean
  emptyMessage?: string
  className?: string
  showCard?: boolean
}

export function DataTable<T = any>({
  data,
  columns,
  title,
  description,
  actions,
  pagination,
  baseUrl,
  loading = false,
  emptyMessage = "No data found.",
  className = "",
  showCard = true
}: DataTableProps<T>) {
  
  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = record[column.key as keyof T]
    
    if (column.render) {
      return column.render(value, record, index)
    }
    
    // Default renderers for common types
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">N/A</span>
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    }
    
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      const date = value instanceof Date ? value : new Date(value)
      return date.toLocaleDateString()
    }
    
    return String(value)
  }

  const renderActions = (record: T) => {
    if (!actions) return null

    const recordActions = typeof actions === 'function' ? actions(record) : actions
    if (!recordActions || recordActions.length === 0) return null

    return (
      <div className="flex items-center justify-end gap-2">
        {recordActions.map((action, index) => {
          if (action.href) {
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant={action.variant || "outline"}
                  size={action.size || "sm"}
                  className={action.className}
                >
                  {action.icon}
                  {action.label && <span className={action.icon ? "ml-2" : ""}>{action.label}</span>}
                </Button>
              </Link>
            )
          }

          return (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size={action.size || "sm"}
              className={action.className}
              onClick={() => action.onClick?.(record)}
            >
              {action.icon}
              {action.label && <span className={action.icon ? "ml-2" : ""}>{action.label}</span>}
            </Button>
          )
        })}
      </div>
    )
  }

  const renderPagination = () => {
    if (!pagination || pagination.last_page <= 1) return null

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.from} to {pagination.to} of {pagination.total} results
        </div>
        <div className="flex gap-2">
          {pagination.current_page > 1 && (
            <Link href={`${baseUrl}?page=${pagination.current_page - 1}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
            const page = i + 1
            const isCurrentPage = page === pagination.current_page
            
            return (
              <Link key={page} href={`${baseUrl}?page=${page}`}>
                <Button
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                >
                  {page}
                </Button>
              </Link>
            )
          })}
          
          {pagination.current_page < pagination.last_page && (
            <Link href={`${baseUrl}?page=${pagination.current_page + 1}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  const tableContent = (
    <>
      <div className="overflow-x-auto">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.title}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                  <div className="text-muted-foreground">{emptyMessage}</div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={(record as any).id || index} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {renderCell(column, record, index)}
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell className="text-right">
                      {renderActions(record)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {renderPagination()}
    </>
  )

  if (!showCard) {
    return tableContent
  }

  return (
    <Card className="border-border/50 shadow-sm">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {tableContent}
      </CardContent>
    </Card>
  )
}

// Helper functions for common column types
export const createStatusColumn = <T,>(key: string, title: string = "Status"): TableColumn<T> => ({
  key,
  title,
  render: (value) => {
    const statusColors = {
      active: "bg-green-100 text-green-800 hover:bg-green-200",
      inactive: "secondary",
      banned: "destructive",
      pending: "secondary",
      reviewed: "default",
      approved: "bg-green-100 text-green-800 hover:bg-green-200",
      rejected: "destructive",
      verified: "bg-green-100 text-green-800",
      unverified: "secondary"
    }
    
    const variant = statusColors[value as keyof typeof statusColors] || "secondary"
    
    return (
      <Badge className={typeof variant === 'string' && variant.includes('bg-') ? variant : ""} variant={typeof variant === 'string' && !variant.includes('bg-') ? variant as any : "default"}>
        {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
      </Badge>
    )
  }
})

export const createDateColumn = <T,>(key: string, title: string = "Date", format?: Intl.DateTimeFormatOptions): TableColumn<T> => ({
  key,
  title,
  render: (value) => {
    if (!value) return <span className="text-muted-foreground">N/A</span>
    
    const date = value instanceof Date ? value : new Date(value)
    const defaultFormat = { year: 'numeric', month: 'short', day: 'numeric' } as const
    
    return date.toLocaleDateString('en-US', format || defaultFormat)
  }
})

export const createBooleanColumn = <T,>(key: string, title: string, labels?: { true: string; false: string }): TableColumn<T> => ({
  key,
  title,
  render: (value) => {
    const trueLabel = labels?.true || "Yes"
    const falseLabel = labels?.false || "No"
    
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? trueLabel : falseLabel}
      </Badge>
    )
  }
})
