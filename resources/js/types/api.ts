import { PaginatedData } from './common';
import { SupplierProfile } from './supplier';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {}

// Supplier API Types
export interface SupplierListResponse extends PaginatedResponse<SupplierProfile> {}

export interface SupplierSingleResponse extends ApiResponse<SupplierProfile> {}

export interface SupplierStatusUpdateRequest {
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  notes?: string;
}

export interface PayoutMethodUpdateRequest {
  type: 'bank_transfer' | 'paypal' | 'other';
  details: Record<string, any>;
  is_verified: boolean;
}

export interface CommissionUpdateRequest {
  commission_rate: number;
}

// Error Types
export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Helper type for API function return values
export type ApiResult<T> = 
  | { data: T; error: null }
  | { data: null; error: ApiError };
