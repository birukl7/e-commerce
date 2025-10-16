import { PageProps as InertiaPageProps } from '@inertiajs/inertia';
import { AxiosInstance } from 'axios';
import { RouteParam, RouteParamsWithQueryOverload } from 'ziggy-js';

declare global {
  interface Window {
    axios: AxiosInstance;
  }

  const route: {
    (name: string, params?: RouteParamsWithQueryOverload | RouteParam, absolute?: boolean): string;
    current: (givenName?: string) => boolean;
  };
}

declare module '@inertiajs/inertia' {
  interface PageProps extends InertiaPageProps {
    auth: {
      user: {
        id: number;
        name: string;
        email: string;
        is_admin: boolean;
        is_supplier: boolean;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
      } | null;
    };
    flash: {
      success?: string;
      error?: string;
      info?: string;
      warning?: string;
    };
  }
}

// This is important to avoid TypeScript errors when using the `route()` helper
declare module 'ziggy-js' {
  interface RouteParam {
    [key: string]: string | number | boolean | null | undefined;
  }
}
