import { describe, it, expect } from 'vitest'
import { imagePlaceholder, stripImagePlaceholders } from '../src/image-placeholder.ts'

describe('imagePlaceholder', () => {
  it('formats a 1-based token', () => {
    expect(imagePlaceholder(1)).toBe('[Image #1]')
    expect(imagePlaceholder(3)).toBe('[Image #3]')
  })
})

describe('stripImagePlaceholders', () => {
  it('removes a single placeholder token, leaving the surrounding text as-is', () => {
    // The token is simply deleted -- no double-space collapsing -- so
    // adjacent whitespace on either side of it is preserved verbatim.
    expect(stripImagePlaceholders('look at [Image #1] please')).toBe('look at  please')
  })

  it('trims leading/trailing whitespace left over when the placeholder was the whole message', () => {
    expect(stripImagePlaceholders('[Image #1]')).toBe('')
    expect(stripImagePlaceholders('  [Image #1]  ')).toBe('')
  })

  it('removes multiple placeholders in one line', () => {
    const out = stripImagePlaceholders('[Image #1] and [Image #2]')
    expect(out).not.toContain('[Image #1]')
    expect(out).not.toContain('[Image #2]')
  })

  it('leaves ordinary text untouched', () => {
    expect(stripImagePlaceholders('hello world')).toBe('hello world')
  })

  it('leaves a malformed/partial token as literal text (v1 accepted degradation)', () => {
    expect(stripImagePlaceholders('half-deleted [Image #')).toBe('half-deleted [Image #')
  })
})
