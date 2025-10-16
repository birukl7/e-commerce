import { useState, useCallback } from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { get, post, put, del, ApiResult } from '@/utils/api';
import { 
  SupplierProfile, 
  SupplierStatusUpdateRequest, 
  PayoutMethodUpdateRequest, 
  CommissionUpdateRequest 
} from '@/types/supplier';
import { PaginatedData } from '@/types/common';

interface UseSuppliersOptions {
  initialPage?: number;
  perPage?: number;
}

export function useSuppliers({ 
  initialPage = 1, 
  perPage = 15 
}: UseSuppliersOptions = {}) {
  const { csrf } = usePage().props as { csrf: string };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<PaginatedData<SupplierProfile>>({
    data: [],
    current_page: initialPage,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const fetchSuppliers = useCallback(async (params: Record<string, any> = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await get<PaginatedData<SupplierProfile>>('/admin/suppliers', {
        params: {
          page: params.page || initialPage,
          per_page: params.per_page || perPage,
          search: params.search || '',
          status: params.status || '',
          ...params,
        },
      });

      if (error) {
        setError(error.message || 'Failed to fetch suppliers');
        return { data: null, error };
      }

      if (data) {
        setSuppliers(data);
        return { data, error: null };
      }

      return { data: null, error: { message: 'No data received', status: 0 } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { data: null, error: { message, status: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, [initialPage, perPage]);

  const fetchSupplier = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await get<SupplierProfile>(`/admin/suppliers/${id}`);

      if (error) {
        setError(error.message || 'Failed to fetch supplier');
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { data: null, error: { message, status: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: number, data: SupplierStatusUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: updatedSupplier, error } = await put<SupplierProfile>(
        `/admin/suppliers/${id}/status`,
        data,
        { headers: { 'X-CSRF-TOKEN': csrf } }
      );

      if (error) {
        setError(error.message || 'Failed to update status');
        return { data: null, error };
      }

      // Update the supplier in the list if it exists
      setSuppliers(prev => ({
        ...prev,
        data: prev.data.map(supplier => 
          supplier.id === id ? { ...supplier, ...updatedSupplier } : supplier
        ),
      }));

      return { data: updatedSupplier, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { data: null, error: { message, status: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, [csrf]);

  const updatePayoutMethod = useCallback(async (id: number, data: PayoutMethodUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: updatedSupplier, error } = await put<SupplierProfile>(
        `/admin/suppliers/${id}/payout-method`,
        data,
        { headers: { 'X-CSRF-TOKEN': csrf } }
      );

      if (error) {
        setError(error.message || 'Failed to update payout method');
        return { data: null, error };
      }

      // Update the supplier in the list if it exists
      setSuppliers(prev => ({
        ...prev,
        data: prev.data.map(supplier => 
          supplier.id === id ? { ...supplier, payout_method: updatedSupplier.payout_method } : supplier
        ),
      }));

      return { data: updatedSupplier, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { data: null, error: { message, status: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, [csrf]);

  const updateCommission = useCallback(async (id: number, data: CommissionUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: updatedSupplier, error } = await put<SupplierProfile>(
        `/admin/suppliers/${id}/commission`,
        data,
        { headers: { 'X-CSRF-TOKEN': csrf } }
      );

      if (error) {
        setError(error.message || 'Failed to update commission');
        return { data: null, error };
      }

      // Update the supplier in the list if it exists
      setSuppliers(prev => ({
        ...prev,
        data: prev.data.map(supplier => 
          supplier.id === id ? { ...supplier, default_commission_rate: updatedSupplier.default_commission_rate } : supplier
        ),
      }));

      return { data: updatedSupplier, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { data: null, error: { message, status: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, [csrf]);

  const deleteSupplier = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await del(`/admin/suppliers/${id}`, {
        headers: { 'X-CSRF-TOKEN': csrf },
      });

      if (error) {
        setError(error.message || 'Failed to delete supplier');
        return { error };
      }

      // Remove the supplier from the list
      setSuppliers(prev => ({
        ...prev,
        data: prev.data.filter(supplier => supplier.id !== id),
        total: prev.total - 1,
      }));

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { error: { message, status: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, [csrf]);

  return {
    // State
    suppliers,
    isLoading,
    error,
    
    // Actions
    fetchSuppliers,
    fetchSupplier,
    updateStatus,
    updatePayoutMethod,
    updateCommission,
    deleteSupplier,
  };
}
