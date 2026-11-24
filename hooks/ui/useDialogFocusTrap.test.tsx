// @vitest-environment jsdom
import React, { useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDialogFocusTrap } from './useDialogFocusTrap'

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

function Dialog({ name, onClose, disableEscape = false }: { name: string; onClose: () => void; disableEscape?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  useDialogFocusTrap({ open: true, containerRef, initialFocusRef, onClose, disableEscape })
  return <div ref={containerRef} tabIndex={-1}>
    <button ref={initialFocusRef} id={name + '-first'}>First</button>
    <button id={name + '-last'}>Last</button>
  </div>
}

describe('dialog keyboard and focus lifecycle', () => {
  let host: HTMLDivElement
  let opener: HTMLButtonElement
  let root: Root
  const flushFocus = () => act(() => { vi.advanceTimersByTime(20) })
  const key = (name: string, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true, cancelable: true })
    act(() => { document.activeElement?.dispatchEvent(event) })
    return event
  }
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => window.setTimeout(() => cb(0), 1))
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => window.clearTimeout(id))
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList)
    host = document.createElement('div')
    opener = document.createElement('button')
    document.body.append(opener, host)
    root = createRoot(host)
    opener.focus()
  })
  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    opener.remove()
    vi.restoreAllMocks()
    vi.useRealTimers()
    document.body.style.overflow = ''
  })
  it('cycles tab and shift-tab within a dialog and restores the opener', () => {
    act(() => root.render(<Dialog name="one" onClose={() => {}} />))
    flushFocus()
    expect(document.activeElement?.id).toBe('one-first')
    expect(key('Tab', true).defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('one-last')
    key('Tab')
    expect(document.activeElement?.id).toBe('one-first')
    act(() => root.render(null))
    expect(document.activeElement).toBe(opener)
    expect(document.body.style.overflow).toBe('')
  })
  it('does not reset focus when the close callback changes', () => {
    const first = vi.fn(), latest = vi.fn()
    act(() => root.render(<Dialog name="one" onClose={first} />))
    flushFocus()
    document.getElementById('one-last')?.focus()
    act(() => root.render(<Dialog name="one" onClose={latest} />))
    flushFocus()
    expect(document.activeElement?.id).toBe('one-last')
    key('Escape')
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledTimes(1)
  })
  it('only closes the top dialog and maintains scroll lock until all close', () => {
    const parent = vi.fn(), child = vi.fn()
    act(() => root.render(<><Dialog name="parent" onClose={parent} /></>))
    flushFocus()
    act(() => root.render(<><Dialog name="parent" onClose={parent} /><Dialog name="child" onClose={child} /></>))
    flushFocus()
    key('Escape')
    expect(child).toHaveBeenCalledTimes(1)
    expect(parent).not.toHaveBeenCalled()
    act(() => root.render(<><Dialog name="parent" onClose={parent} /></>))
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement?.id).toBe('parent-first')
    act(() => root.render(null))
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)
  })
  it('allows an inner shortcut panel to handle Escape independently', () => {
    const close = vi.fn()
    act(() => root.render(<Dialog name="one" onClose={close} disableEscape />))
    flushFocus()
    expect(key('Escape').defaultPrevented).toBe(false)
    expect(close).not.toHaveBeenCalled()
  })
})
