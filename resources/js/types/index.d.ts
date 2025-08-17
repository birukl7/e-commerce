import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';


export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}


export interface Category {
    id: number
    name: string
    slug: string
    description: string
    image: string
    parent_id: number | null
    sort_order: number
    is_active: boolean
    product_count?: number
    subcategories?: Category[]
  }

  export interface ProductImage {
    id: number
    image_path: string
    alt_text: string
    is_primary: boolean
    sort_order: number
  }

  export interface Brand {
    id: number
    name: string
    slug: string
    is_active: boolean
  }

  export interface Product {
    id: number
    name: string
    slug: string
    description: string
    sku: string
    price: number
    sale_price?: number | null
    cost_price?: number | null
    stock_quantity: number
    manage_stock: boolean
    stock_status: string
    weight?: number | null
    length?: number | null
    width?: number | null
    height?: number | null
    category_id: number
    brand_id: number
    featured: boolean
    status: string
    meta_title?: string | null
    meta_description?: string | null
    created_at: string
    updated_at: string
    category: Category
    brand: Brand
    images: ProductImage[]
  }

  export interface Paginated<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
    links: { url: string | null; label: string; active: boolean }[]
  }