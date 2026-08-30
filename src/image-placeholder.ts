/**
 * Shared token format for a pasted-image placeholder inserted into the input
 * draft. Purely a UI affordance -- what's actually sent is the authoritative
 * pending-images list the render layer tracks alongside the draft text, in
 * paste order; a placeholder token surviving in the text or not doesn't
 * change whether its image gets attached (see `input-bar.tsx`'s Ctrl+V
 * handler and `app.tsx`'s submit wiring).
 */

const PLACEHOLDER_RE = /\[Image #\d+\]/g

/** The placeholder token inserted into the draft for the Nth pasted image (1-based). */
export function imagePlaceholder(n: number): string {
  return `[Image #${n}]`
}

/** Remove every image placeholder token from a line of text before it's sent as the text block. */
export function stripImagePlaceholders(text: string): string {
  return text.replace(PLACEHOLDER_RE, '').trim()
}
