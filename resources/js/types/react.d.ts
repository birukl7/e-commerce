import { ReactNode } from 'react';

declare module 'react' {
  // Add any custom prop types here
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add any custom HTML attributes here
    class?: string;
    activeClassName?: string;
    active?: boolean;
  }

  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    activeClassName?: string;
    active?: boolean;
  }

  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  }
}

// Global component props
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Add any custom elements here
      'ion-icon': {
        name: string;
        class?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

// Extend Inertia's Link component
declare module '@inertiajs/inertia-react' {
  interface LinkProps {
    href: string;
    method?: string;
    data?: object;
    replace?: boolean;
    preserveScroll?: boolean | ((props: any) => boolean);
    preserveState?: boolean | ((props: any) => boolean);
    only?: string[];
    headers?: object;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    as?: string;
    className?: string;
    activeClassName?: string;
    active?: boolean;
    children?: ReactNode;
  }
}
