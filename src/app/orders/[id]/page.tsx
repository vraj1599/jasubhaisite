'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download, MapPin, Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrderDetail {
  _id: string
  items: { name: string; size: string; quantity: number; price: number; image: string }[]
  subtotal: number
  shipping: number
  total: number
  status: string
  paymentStatus: string
  razorpayOrderId: string
  razorpayPaymentId: string
  createdAt: string
  shippingAddress: {
    name: string; phone: string; line1: string
    locality: string; city: string; state: string; country: string; pincode: string
  }
}

const TRACK_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: Package,      desc: 'Your order has been placed' },
  { key: 'confirmed',  label: 'Confirmed',     icon: CheckCircle,  desc: 'Order confirmed by seller' },
  { key: 'processing', label: 'Processing',    icon: Clock,        desc: 'Being prepared for dispatch' },
  { key: 'shipped',    label: 'Shipped',       icon: Truck,        desc: 'Out for delivery' },
  { key: 'delivered',  label: 'Delivered',     icon: CheckCircle,  desc: 'Delivered successfully' },
]

const STATUS_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
}

function printInvoice(order: OrderDetail) {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6">${item.name}<br><small style="color:#6b7280">Size: ${item.size}</small></td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:center">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right">₹${Math.round(item.price)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right">₹${Math.round(item.price * item.quantity)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${order._id.slice(-8).toUpperCase()}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box }
    body { font-family: Arial, sans-serif; color:#1f2937; font-size:13px; padding:40px }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:24px; border-bottom:2px solid #f59e0b }
    .brand { display:flex; align-items:center; gap:12px }
    .logo { width:48px; height:48px; background:linear-gradient(135deg,#f59e0b,#f97316); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:18px }
    .brand-name { font-size:20px; font-weight:900; color:#1f2937 }
    .brand-sub { font-size:12px; color:#f59e0b; font-weight:600 }
    .invoice-meta { text-align:right }
    .invoice-title { font-size:24px; font-weight:900; color:#f59e0b; margin-bottom:4px }
    .meta-line { font-size:12px; color:#6b7280; margin-top:2px }
    .status-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; text-transform:capitalize; background:#d1fae5; color:#065f46 }
    .section { margin-bottom:24px }
    .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#9ca3af; margin-bottom:8px }
    .address-box { background:#f9fafb; padding:12px 16px; border-radius:8px; border:1px solid #f3f4f6; line-height:1.6 }
    table { width:100%; border-collapse:collapse; margin-bottom:0 }
    th { background:#f9fafb; padding:10px 8px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; color:#6b7280; border-bottom:2px solid #e5e7eb }
    th:last-child, td:last-child { text-align:right }
    th:nth-child(2), td:nth-child(2) { text-align:center }
    .totals { margin-left:auto; width:240px; margin-top:0 }
    .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#6b7280 }
    .total-final { display:flex; justify-content:space-between; padding:10px 0; font-size:16px; font-weight:900; color:#1f2937; border-top:2px solid #1f2937; margin-top:4px }
    .payment-section { display:flex; gap:24px; margin-top:24px }
    .payment-box { flex:1; background:#f9fafb; border:1px solid #f3f4f6; border-radius:8px; padding:12px 16px }
    .payment-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#9ca3af; margin-bottom:4px }
    .payment-value { font-size:13px; font-weight:600; color:#1f2937; word-break:break-all }
    .footer { margin-top:40px; padding-top:16px; border-top:1px solid #f3f4f6; text-align:center; color:#9ca3af; font-size:11px }
    @media print {
      body { padding:20px }
      .no-print { display:none }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo">JC</div>
      <div>
        <div class="brand-name">Jasubhai Chappal</div>
        <div class="brand-sub">Premium Indian Footwear</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">INVOICE</div>
      <div class="meta-line">#${order._id.slice(-8).toUpperCase()}</div>
      <div class="meta-line">${date}</div>
      <div class="meta-line" style="margin-top:6px"><span class="status-badge">PAID</span></div>
    </div>
  </div>

  <div style="display:flex;gap:24px;margin-bottom:24px">
    <div style="flex:1">
      <div class="section-title">Bill To</div>
      <div class="address-box">
        <strong>${order.shippingAddress.name}</strong><br>
        ${order.shippingAddress.line1}${order.shippingAddress.locality ? ', ' + order.shippingAddress.locality : ''}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} – ${order.shippingAddress.pincode}<br>
        ${order.shippingAddress.country}<br>
        <span style="color:#6b7280">Ph: ${order.shippingAddress.phone}</span>
      </div>
    </div>
  </div>

  <div class="section-title">Order Items</div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div style="display:flex;justify-content:flex-end;margin-top:16px">
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>₹${Math.round(order.subtotal)}</span></div>
      <div class="total-row"><span>Shipping</span><span>${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</span></div>
      <div class="total-final"><span>Total Paid</span><span>₹${Math.round(order.total)}</span></div>
    </div>
  </div>

  <div class="payment-section">
    <div class="payment-box">
      <div class="payment-label">Payment Status</div>
      <div class="payment-value" style="color:#059669;text-transform:capitalize">${order.paymentStatus}</div>
    </div>
    ${order.razorpayPaymentId ? `
    <div class="payment-box">
      <div class="payment-label">Payment ID</div>
      <div class="payment-value">${order.razorpayPaymentId}</div>
    </div>` : ''}
    ${order.razorpayOrderId ? `
    <div class="payment-box">
      <div class="payment-label">Order ID</div>
      <div class="payment-value">${order.razorpayOrderId}</div>
    </div>` : ''}
  </div>

  <div class="footer">
    Thank you for shopping with Jasubhai Chappal! For support, contact us at support@jasubhaichappal.com
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    axios.get(`/api/orders/${params.id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
        </div>
      </main>
    </>
  )

  if (notFound || !order) return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-20 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/orders"><button className="mt-4 text-amber-600 font-semibold">Back to Orders</button></Link>
      </main>
    </>
  )

  const currentStep = STATUS_INDEX[order.status] ?? 0
  const isCancelled = order.status === 'cancelled'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">

          {/* Back + Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link href="/orders">
                <button className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="font-black text-gray-900 text-lg">Order #{order._id.slice(-8).toUpperCase()}</h1>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => printInvoice(order)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              <Download size={15} /> Download Bill
            </button>
          </div>

          <div className="space-y-4">
            {/* Order Tracking */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Truck size={18} className="text-amber-500" /> Order Tracking
              </h2>

              {isCancelled ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <XCircle size={24} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-700">Order Cancelled</p>
                    <p className="text-sm text-red-500">This order has been cancelled.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />

                  <div className="space-y-5">
                    {TRACK_STEPS.map(({ key, label, icon: Icon, desc }, idx) => {
                      const done    = idx <= currentStep
                      const current = idx === currentStep
                      return (
                        <div key={key} className="flex items-start gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                            done ? 'bg-amber-500 shadow-md shadow-amber-200' : 'bg-gray-100'
                          }`}>
                            <Icon size={15} className={done ? 'text-white' : 'text-gray-400'} />
                          </div>
                          <div className={`pt-0.5 ${!done ? 'opacity-40' : ''}`}>
                            <p className={`font-bold text-sm ${current ? 'text-amber-600' : 'text-gray-900'}`}>{label}</p>
                            <p className="text-xs text-gray-500">{desc}</p>
                            {current && (
                              <span className="inline-block mt-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Current Status
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Items */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={18} className="text-amber-500" /> Items ({order.items.length})
              </h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">₹{Math.round(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">₹{Math.round(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>₹{Math.round(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className={order.shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Paid</span><span>₹{Math.round(order.total)}</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Payment Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Payment Status</p>
                  <p className={`font-bold text-sm capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus}
                  </p>
                </div>
                {order.razorpayPaymentId && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Payment ID</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{order.razorpayPaymentId}</p>
                  </div>
                )}
                {order.razorpayOrderId && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Razorpay Order ID</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{order.razorpayOrderId}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-amber-500" /> Delivery Address
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}{order.shippingAddress.locality ? `, ${order.shippingAddress.locality}` : ''}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="mt-1 text-gray-500">Ph: {order.shippingAddress.phone}</p>}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
