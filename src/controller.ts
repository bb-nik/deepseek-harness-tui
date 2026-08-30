/**
 * The controller contract the ink App calls back into. Implemented by the host
 * plugin; the render layer stays transport-free and unit-testable.
 */

import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions'
import type { ApprovalOutcome } from '@deepseek-ai/dsh-user-approval'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'

/** One selectable session in the resume/new-session picker. */
export interface SessionChoice {
  id: string
  title: string
  cwd?: string
  createdAt: number
  live: boolean
}

/** Actions the terminal UI invokes on the host. */
export interface TuiController {
  /** Submit a free-text prompt or a slash command line, with any images pasted into the draft (paste order). */
  submit(line: string, images?: readonly ImageAttachmentRef[]): void
  /**
   * Read one image off the OS clipboard and durably save it.
   * @returns the saved attachment, or `undefined` when the clipboard holds no image.
   */
  pasteImageFromClipboard(): Promise<ImageAttachmentRef | undefined>
  /** Surface a transient status-bar notice (mirrors slash-command feedback). */
  notice(text: string, level?: 'info' | 'error'): void
  /** Answer the active user question. */
  answerQuestion(answer: AskUserQuestionAnswer): void
  /** Reject the active user question (aborted). */
  rejectQuestion(error: unknown): void
  /** Answer the active approval. */
  answerApproval(outcome: ApprovalOutcome): void
  /** Request process exit. */
  quit(): void
  /** Ask the host to (re)load the session list for the picker. */
  refreshSessions(): void
  /** Switch to a session (resume an existing or create a new one). */
  switchSession(id: string): void
  /** List the slash commands available for the current agent. */
  listCommands(): readonly { name: string; description: string; input?: { hint: string } }[]
  /** Start loading the `@`-mention file index if it hasn't been already (idempotent). */
  ensureFileIndex(): void
}
