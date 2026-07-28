export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Pluggable outbound email. Provider is chosen via EMAIL_PROVIDER:
 * - "resend": uses the Resend HTTP API (RESEND_API_KEY)
 * - "smtp": uses SMTP_* credentials via nodemailer-compatible fetch is not
 *   available here without adding nodemailer as a dependency, so SMTP is
 *   wired through Resend's SMTP-compatible relay when configured; until a
 *   concrete SMTP relay is confirmed this falls back to console logging.
 * - "console" (default): logs the email — safe no-op for local development
 *   and for environments where no provider is configured yet.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ delivered: boolean }> {
  const provider = process.env.EMAIL_PROVIDER || 'console'
  const from = process.env.EMAIL_FROM || 'Printcom <no-reply@printcom.ma>'

  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        reply_to: input.replyTo || process.env.EMAIL_REPLY_TO,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('[email] Resend send failed', response.status, errorText)
      return { delivered: false }
    }

    return { delivered: true }
  }

  // console fallback (also used when a provider is misconfigured, so a
  // submission never silently disappears without at least a server log)
  console.info('[email:console]', {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })
  return { delivered: provider === 'console' }
}
