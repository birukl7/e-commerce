export interface SupplierProfile {
  id: number;
  business_name: string;
  business_email: string;
  phone: string;
  tax_id?: string;
  verification_status: 'pending' | 'approved' | 'rejected' | 'banned';
  default_commission_rate: number;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    formatted: string;
  };
  payout_method?: {
    type: 'bank_transfer' | 'paypal' | 'other';
    details: Record<string, any>;
    is_verified: boolean;
    verification_requested_at?: string;
  };
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_by_admin_id?: number;
}

export interface SupplierFilters {
  search?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'banned';
}

export interface SupplierStatusUpdate {
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  notes?: string;
}

export interface PayoutMethodUpdate {
  type: 'bank_transfer' | 'paypal' | 'other';
  details: Record<string, any>;
  is_verified: boolean;
}

export interface CommissionUpdate {
  commission_rate: number;
}
