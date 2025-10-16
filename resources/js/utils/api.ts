import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResult } from '@/types/api';

// Create axios instance with base URL from environment or default
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  withXSRFToken: true,
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      const errorMessage = data?.message || 'An error occurred';
      
      const apiError: ApiError = {
        message: errorMessage,
        status,
        errors: data?.errors,
      };
      
      return Promise.reject(apiError);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        message: 'No response received from server',
        status: 0,
      } as ApiError);
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({
        message: error.message || 'An error occurred',
        status: 0,
      } as ApiError);
    }
  }
);

/**
 * Make an API request with proper TypeScript types and error handling
 * @param config Axios request configuration
 * @returns Promise with typed response data or error
 */
export async function apiRequest<T = any>(
  config: AxiosRequestConfig
): Promise<ApiResult<T>> {
  try {
    const response = await api.request<T>(config);
    return { data: response.data, error: null };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { 
        data: null, 
        error: {
          message: error.response.data?.message || 'An error occurred',
          status: error.response.status,
          errors: error.response.data?.errors,
        }
      };
    }
    
    const err = error as Error;
    return { 
      data: null, 
      error: { 
        message: err.message || 'An unexpected error occurred',
        status: 0,
      } 
    };
  }
}

/**
 * Make a GET request
 */
export async function get<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  return apiRequest<T>({ ...config, method: 'GET', url });
}

/**
 * Make a POST request
 */
export async function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  return apiRequest<T>({ ...config, method: 'POST', url, data });
}

/**
 * Make a PUT request
 */
export async function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  return apiRequest<T>({ ...config, method: 'PUT', url, data });
}

/**
 * Make a PATCH request
 */
export async function patch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  return apiRequest<T>({ ...config, method: 'PATCH', url, data });
}

/**
 * Make a DELETE request
 */
export async function del<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResult<T>> {
  return apiRequest<T>({ ...config, method: 'DELETE', url });
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  request: apiRequest,
};
