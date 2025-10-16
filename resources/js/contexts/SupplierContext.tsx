import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { SupplierProfile, SupplierStatusUpdateRequest, PayoutMethodUpdateRequest, CommissionUpdateRequest } from '@/types/supplier';
import { PaginatedData } from '@/types/common';

type SupplierState = {
  suppliers: PaginatedData<SupplierProfile>;
  currentSupplier: SupplierProfile | null;
  isLoading: boolean;
  error: string | null;
};

type SupplierAction =
  | { type: 'FETCH_SUPPLIERS_REQUEST' }
  | { type: 'FETCH_SUPPLIERS_SUCCESS'; payload: PaginatedData<SupplierProfile> }
  | { type: 'FETCH_SUPPLIERS_FAILURE'; payload: string }
  | { type: 'FETCH_SUPPLIER_REQUEST' }
  | { type: 'FETCH_SUPPLIER_SUCCESS'; payload: SupplierProfile }
  | { type: 'FETCH_SUPPLIER_FAILURE'; payload: string }
  | { type: 'UPDATE_STATUS_REQUEST' }
  | { type: 'UPDATE_STATUS_SUCCESS'; payload: { id: number; status: string } }
  | { type: 'UPDATE_STATUS_FAILURE'; payload: string }
  | { type: 'UPDATE_PAYOUT_METHOD_REQUEST' }
  | { type: 'UPDATE_PAYOUT_METHOD_SUCCESS'; payload: { id: number; payoutMethod: any } }
  | { type: 'UPDATE_PAYOUT_METHOD_FAILURE'; payload: string }
  | { type: 'UPDATE_COMMISSION_REQUEST' }
  | { type: 'UPDATE_COMMISSION_SUCCESS'; payload: { id: number; commissionRate: number } }
  | { type: 'UPDATE_COMMISSION_FAILURE'; payload: string }
  | { type: 'DELETE_SUPPLIER_REQUEST' }
  | { type: 'DELETE_SUPPLIER_SUCCESS'; payload: number }
  | { type: 'DELETE_SUPPLIER_FAILURE'; payload: string };

type SupplierContextType = {
  state: SupplierState;
  fetchSuppliers: (params?: Record<string, any>) => Promise<void>;
  fetchSupplier: (id: number) => Promise<SupplierProfile | null>;
  updateStatus: (id: number, data: SupplierStatusUpdateRequest) => Promise<boolean>;
  updatePayoutMethod: (id: number, data: PayoutMethodUpdateRequest) => Promise<boolean>;
  updateCommission: (id: number, data: CommissionUpdateRequest) => Promise<boolean>;
  deleteSupplier: (id: number) => Promise<boolean>;
};

const initialState: SupplierState = {
  suppliers: {
    data: [],
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  },
  currentSupplier: null,
  isLoading: false,
  error: null,
};

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

function supplierReducer(state: SupplierState, action: SupplierAction): SupplierState {
  switch (action.type) {
    case 'FETCH_SUPPLIERS_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUPPLIERS_SUCCESS':
      return { ...state, isLoading: false, suppliers: action.payload };
    case 'FETCH_SUPPLIERS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'FETCH_SUPPLIER_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUPPLIER_SUCCESS':
      return { ...state, isLoading: false, currentSupplier: action.payload };
    case 'FETCH_SUPPLIER_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'UPDATE_STATUS_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'UPDATE_STATUS_SUCCESS': {
      const updatedSuppliers = state.suppliers.data.map(supplier =>
        supplier.id === action.payload.id
          ? { ...supplier, verification_status: action.payload.status as any }
          : supplier
      );
      return {
        ...state,
        isLoading: false,
        suppliers: {
          ...state.suppliers,
          data: updatedSuppliers,
        },
        currentSupplier: state.currentSupplier?.id === action.payload.id
          ? { ...state.currentSupplier, verification_status: action.payload.status as any }
          : state.currentSupplier,
      };
    }
    case 'UPDATE_STATUS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'UPDATE_PAYOUT_METHOD_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'UPDATE_PAYOUT_METHOD_SUCCESS': {
      const updatedSuppliers = state.suppliers.data.map(supplier =>
        supplier.id === action.payload.id
          ? { ...supplier, payout_method: action.payload.payoutMethod }
          : supplier
      );
      return {
        ...state,
        isLoading: false,
        suppliers: {
          ...state.suppliers,
          data: updatedSuppliers,
        },
        currentSupplier: state.currentSupplier?.id === action.payload.id
          ? { ...state.currentSupplier, payout_method: action.payload.payoutMethod }
          : state.currentSupplier,
      };
    }
    case 'UPDATE_PAYOUT_METHOD_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'UPDATE_COMMISSION_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'UPDATE_COMMISSION_SUCCESS': {
      const updatedSuppliers = state.suppliers.data.map(supplier =>
        supplier.id === action.payload.id
          ? { ...supplier, default_commission_rate: action.payload.commissionRate }
          : supplier
      );
      return {
        ...state,
        isLoading: false,
        suppliers: {
          ...state.suppliers,
          data: updatedSuppliers,
        },
        currentSupplier: state.currentSupplier?.id === action.payload.id
          ? { ...state.currentSupplier, default_commission_rate: action.payload.commissionRate }
          : state.currentSupplier,
      };
    }
    case 'UPDATE_COMMISSION_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'DELETE_SUPPLIER_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'DELETE_SUPPLIER_SUCCESS': {
      const updatedSuppliers = state.suppliers.data.filter(
        supplier => supplier.id !== action.payload
      );
      return {
        ...state,
        isLoading: false,
        suppliers: {
          ...state.suppliers,
          data: updatedSuppliers,
          total: state.suppliers.total - 1,
        },
        currentSupplier: state.currentSupplier?.id === action.payload
          ? null
          : state.currentSupplier,
      };
    }
    case 'DELETE_SUPPLIER_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    default:
      return state;
  }
}

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(supplierReducer, initialState);
  const { csrf } = usePage().props as { csrf: string };

  const fetchSuppliers = useCallback(async (params: Record<string, any> = {}) => {
    dispatch({ type: 'FETCH_SUPPLIERS_REQUEST' });
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const response = await fetch(`/admin/suppliers?${queryParams.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch suppliers');
      }
      
      const data = await response.json();
      dispatch({ type: 'FETCH_SUPPLIERS_SUCCESS', payload: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'FETCH_SUPPLIERS_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const fetchSupplier = useCallback(async (id: number) => {
    dispatch({ type: 'FETCH_SUPPLIER_REQUEST' });
    
    try {
      const response = await fetch(`/admin/suppliers/${id}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch supplier ${id}`);
      }
      
      const data = await response.json();
      dispatch({ type: 'FETCH_SUPPLIER_SUCCESS', payload: data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'FETCH_SUPPLIER_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const updateStatus = useCallback(async (id: number, data: SupplierStatusUpdateRequest) => {
    dispatch({ type: 'UPDATE_STATUS_REQUEST' });
    
    try {
      const response = await fetch(`/admin/suppliers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update status for supplier ${id}`);
      }
      
      const result = await response.json();
      dispatch({ 
        type: 'UPDATE_STATUS_SUCCESS', 
        payload: { id, status: result.verification_status } 
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'UPDATE_STATUS_FAILURE', payload: message });
      throw error;
    }
  }, [csrf]);

  const updatePayoutMethod = useCallback(async (id: number, data: PayoutMethodUpdateRequest) => {
    dispatch({ type: 'UPDATE_PAYOUT_METHOD_REQUEST' });
    
    try {
      const response = await fetch(`/admin/suppliers/${id}/payout-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update payout method for supplier ${id}`);
      }
      
      const result = await response.json();
      dispatch({ 
        type: 'UPDATE_PAYOUT_METHOD_SUCCESS', 
        payload: { id, payoutMethod: result.payout_method } 
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'UPDATE_PAYOUT_METHOD_FAILURE', payload: message });
      throw error;
    }
  }, [csrf]);

  const updateCommission = useCallback(async (id: number, data: CommissionUpdateRequest) => {
    dispatch({ type: 'UPDATE_COMMISSION_REQUEST' });
    
    try {
      const response = await fetch(`/admin/suppliers/${id}/commission`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update commission for supplier ${id}`);
      }
      
      const result = await response.json();
      dispatch({ 
        type: 'UPDATE_COMMISSION_SUCCESS', 
        payload: { id, commissionRate: result.default_commission_rate } 
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'UPDATE_COMMISSION_FAILURE', payload: message });
      throw error;
    }
  }, [csrf]);

  const deleteSupplier = useCallback(async (id: number) => {
    dispatch({ type: 'DELETE_SUPPLIER_REQUEST' });
    
    try {
      const response = await fetch(`/admin/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrf,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to delete supplier ${id}`);
      }
      
      dispatch({ type: 'DELETE_SUPPLIER_SUCCESS', payload: id });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'DELETE_SUPPLIER_FAILURE', payload: message });
      throw error;
    }
  }, [csrf]);

  const value = {
    state,
    fetchSuppliers,
    fetchSupplier,
    updateStatus,
    updatePayoutMethod,
    updateCommission,
    deleteSupplier,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplierContext = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSupplierContext must be used within a SupplierProvider');
  }
  return context;
};
