// Lightweight email sender using the Resend HTTP API (no extra dependency).
// Configure with env vars on the server:
//   RESEND_API_KEY = re_xxx           (required to actually send)
//   EMAIL_FROM     = "Jasubhai Chappal <orders@yourdomain.com>"  (verified sender)
// If RESEND_API_KEY is missing, sending is skipped gracefully (logged, never throws),
// so order creation and other flows are never blocked by email.

interface SendArgs { to: string; subject: string; html: string }

export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const key  = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Jasubhai Chappal <onboarding@resend.dev>'
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) {
      console.error('[email] send failed', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[email] error', err)
    return false
  }
}

const shell = (inner: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
    <div style="text-align:center;padding:24px 0;border-bottom:2px solid #f59e0b">
      <span style="font-size:22px;font-weight:800;color:#1f2937">Jasubhai Chappal</span>
    </div>
    ${inner}
    <div style="text-align:center;color:#9ca3af;font-size:12px;padding:24px 0;border-top:1px solid #f3f4f6;margin-top:24px">
      Jasubhai Chappal · Premium Indian Footwear<br>Need help? support@jasubhaichappal.com
    </div>
  </div>`

interface OrderEmailData {
  _id: string
  items: { name: string; size: string; quantity: number; price: number }[]
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export function orderConfirmationEmail(order: OrderEmailData): { subject: string; html: string } {
  const rows = order.items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${i.name} <span style="color:#6b7280">(Size ${i.size} × ${i.quantity})</span></td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">₹${Math.round(i.price * i.quantity)}</td>
    </tr>`).join('')

  const inner = `
    <div style="padding:28px 24px">
      <h1 style="font-size:20px;margin:0 0 6px">Thank you for your order! 🎉</h1>
      <p style="color:#6b7280;margin:0 0 20px">Order <b>#${order._id.slice(-8).toUpperCase()}</b> is confirmed and being prepared.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
        <tr><td style="padding:3px 0;color:#6b7280">Subtotal</td><td style="padding:3px 0;text-align:right">₹${Math.round(order.subtotal)}</td></tr>
        ${order.discount > 0 ? `<tr><td style="padding:3px 0;color:#16a34a">Discount</td><td style="padding:3px 0;text-align:right;color:#16a34a">-₹${Math.round(order.discount)}</td></tr>` : ''}
        <tr><td style="padding:3px 0;color:#6b7280">Shipping</td><td style="padding:3px 0;text-align:right">${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</td></tr>
        <tr><td style="padding:8px 0;font-weight:800;border-top:2px solid #1f2937">Total Paid</td><td style="padding:8px 0;text-align:right;font-weight:800;border-top:2px solid #1f2937">₹${Math.round(order.total)}</td></tr>
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="https://jasubhaichappal.com/orders/${order._id}" style="display:inline-block;background:#f59e0b;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px">Track your order</a>
      </div>
    </div>`
  return { subject: `Order confirmed — #${order._id.slice(-8).toUpperCase()}`, html: shell(inner) }
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  const inner = `
    <div style="padding:28px 24px">
      <h1 style="font-size:20px;margin:0 0 6px">Reset your password</h1>
      <p style="color:#6b7280;margin:0 0 20px">We received a request to reset your password. This link expires in 1 hour. If you didn't request it, you can safely ignore this email.</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#f59e0b;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px">Reset Password</a>
      </div>
      <p style="color:#9ca3af;font-size:12px;word-break:break-all">Or paste this link: ${resetUrl}</p>
    </div>`
  return { subject: 'Reset your Jasubhai Chappal password', html: shell(inner) }
}
