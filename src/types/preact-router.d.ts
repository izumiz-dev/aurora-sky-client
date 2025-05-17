declare module 'preact-router' {
  import { Component, ComponentType, JSX } from 'preact';

  export interface RouteProps<T = {}> {
    path: string;
    component: ComponentType<T>;
    default?: boolean;
  }

  export interface RouterProps {
    url?: string;
    onChange?: (e: { url: string }) => void;
  }

  export interface LinkProps extends JSX.HTMLAttributes<HTMLAnchorElement> {
    activeClassName?: string;
    children?: preact.ComponentChildren;
    href: string;
    class?: string;
    className?: string;
  }

  export class Route<T = {}> extends Component<RouteProps<T> & T> {}
  export class Router extends Component<RouterProps> {}
  export class Link extends Component<LinkProps> {}

  export function useRouter(): { url: string; path: string };
  export function useLocation(): { url: string; path: string; query: Record<string, string> };
  export function useRoute<T = unknown>(): { matches: boolean; params: T; url: string };
  export function route(url: string, replace?: boolean): boolean;
}
