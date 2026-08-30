import { describe, it, expect, vi } from 'vitest'

type ExecFileCallback = (error: Error | null, stdout: string, stderr: string) => void

let mockImpl: (cb: ExecFileCallback) => void = () => {}

vi.mock('node:child_process', () => ({
  execFile: (_cmd: string, _args: string[], _opts: unknown, cb: ExecFileCallback) => { mockImpl(cb) },
}))

const { readClipboardImage } = await import('../src/clipboard-image.ts')

describe('readClipboardImage', () => {
  it('decodes a PNGf AppleScript data literal into raw bytes', async () => {
    // 4-byte payload 0xDEADBEEF, matching osascript's real "«data PNGf<HEX>»" shape.
    mockImpl = cb => { cb(null, '«data PNGfDEADBEEF»\n', '') }
    const result = await readClipboardImage()
    expect(result).toBeDefined()
    expect(result!.mediaType).toBe('image/png')
    expect(Array.from(result!.data)).toEqual([0xDE, 0xAD, 0xBE, 0xEF])
  })

  it('resolves undefined when the clipboard holds no image (osascript -1700)', async () => {
    mockImpl = cb => { cb(new Error('execution error'), '', "0:29: execution error: Can't make some data into the expected type. (-1700)") }
    const result = await readClipboardImage()
    expect(result).toBeUndefined()
  })

  it('rejects on an unexpected failure', async () => {
    mockImpl = cb => { cb(new Error('osascript: command not found'), '', 'command not found') }
    await expect(readClipboardImage()).rejects.toThrow('command not found')
  })

  it('resolves undefined when stdout does not match the expected data literal', async () => {
    mockImpl = cb => { cb(null, 'unexpected output\n', '') }
    const result = await readClipboardImage()
    expect(result).toBeUndefined()
  })
})
