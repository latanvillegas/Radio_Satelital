declare module 'react-dom/client' {
  import type { ReactNode } from 'react'

  export interface Root {
    render(children: ReactNode): void
    unmount(): void
  }

  export function createRoot(container: Element | DocumentFragment): Root
}

declare module 'react-dom/test-utils' {
  export function act(callback: () => void | undefined): void
  export function act<T>(callback: () => Promise<T>): Promise<T>
}
