/**
 * A hidden field named `website` (never rendered visibly, but present in
 * the DOM) that legitimate users never fill. Bots that auto-fill every
 * input trip it. Returning true means "treat as spam".
 */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}
