"use client"

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])', 'a[href]', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]',
].join(',')

interface UseDialogFocusTrapOptions {
  open: boolean
  onClose: () => void
  containerRef: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
  disableEscape?: boolean
}

interface DialogEntry {
  containerRef: RefObject<HTMLElement | null>
  previousFocus: HTMLElement | null
}

const stack: DialogEntry[] = []
let originalOverflow = ''

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => el.tabIndex >= 0 && !el.matches(':disabled') &&
      !el.closest('[inert], [hidden], [aria-hidden="true"]') &&
      el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible')
}

function focusFallback(entry: DialogEntry) {
  const container = entry.containerRef.current
  if (container) (focusableElements(container)[0] || container).focus()
}

export function useDialogFocusTrap({
  open,
  onClose,
  containerRef,
  initialFocusRef,
  disableEscape = false,
}: UseDialogFocusTrapOptions) {
  const optionsRef = useRef({ onClose, disableEscape })
  useEffect(() => {
    optionsRef.current = { onClose, disableEscape }
  }, [onClose, disableEscape])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const entry: DialogEntry = {
      containerRef,
      previousFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    }
    if (!stack.length) {
      originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    stack.push(entry)
    const isTop = () => stack[stack.length - 1] === entry

    const focusTimer = window.requestAnimationFrame(() => {
      if (!isTop()) return
      const target = initialFocusRef?.current
      if (target && containerRef.current?.contains(target)) target.focus()
      else focusFallback(entry)
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTop() || event.defaultPrevented) return
      if (event.key === 'Escape' && !optionsRef.current.disableEscape) {
        event.preventDefault()
        event.stopPropagation()
        optionsRef.current.onClose()
        return
      }
      if (event.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return
      const elements = focusableElements(container)
      const active = document.activeElement
      if (!elements.length) {
        event.preventDefault()
        container.focus()
      } else if (event.shiftKey && (active === elements[0] || !elements.includes(active as HTMLElement))) {
        event.preventDefault()
        elements[elements.length - 1].focus()
      } else if (!event.shiftKey && (active === elements[elements.length - 1] || !elements.includes(active as HTMLElement))) {
        event.preventDefault()
        elements[0].focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      const wasTop = isTop()
      const index = stack.indexOf(entry)
      // When removing a parent first, preserve the original opener for its child.
      const child = stack[index + 1]
      if (child && entry.containerRef.current?.contains(child.previousFocus)) {
        child.previousFocus = entry.previousFocus
      }
      if (index >= 0) stack.splice(index, 1)
      if (!stack.length) document.body.style.overflow = originalOverflow
      if (!wasTop) return
      const top = stack[stack.length - 1]
      const target = entry.previousFocus
      if (target?.isConnected && (!top || top.containerRef.current?.contains(target))) target.focus()
      else if (top) focusFallback(top)
    }
  }, [open, containerRef, initialFocusRef])
}
