/**
 * macOS clipboard image read. A terminal has no way to deliver clipboard
 * *image* bytes through normal keyboard input -- Cmd+V is intercepted by the
 * terminal emulator itself and, even when it isn't, a tty only ever carries
 * text over stdin. Reading the OS clipboard directly via `osascript` (ships
 * with macOS, no new dependency) is the only way to get real image bytes
 * into this process; the caller must trigger it from a dedicated keybinding,
 * not infer it from paste content the way text-paste is handled.
 */

import { execFile } from 'node:child_process'

export interface ClipboardImage {
  data: Uint8Array
  mediaType: 'image/png'
}

/** osascript's own coercion-failure code when the clipboard holds no image. */
const NO_IMAGE_ERROR_CODE = '-1700'

/**
 * Read the current clipboard contents as PNG bytes.
 * @returns the decoded image, or `undefined` when the clipboard holds no image.
 * @throws on any other, unexpected failure (osascript missing, a real I/O error, ...).
 */
export function readClipboardImage(): Promise<ClipboardImage | undefined> {
  return new Promise((resolvePromise, reject) => {
    execFile(
      'osascript',
      ['-e', 'the clipboard as «class PNGf»'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error !== null) {
          if (stderr.includes(NO_IMAGE_ERROR_CODE)) { resolvePromise(undefined); return }
          reject(error)
          return
        }
        const match = /«data PNGf([0-9A-Fa-f]+)»/.exec(stdout)
        if (match === null) { resolvePromise(undefined); return }
        const hex = match[1]!
        const data = new Uint8Array(hex.length / 2)
        for (let i = 0; i < data.length; i++) {
          data[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
        }
        resolvePromise({ data, mediaType: 'image/png' })
      },
    )
  })
}
