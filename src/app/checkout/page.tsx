'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { calcShipping, DEFAULT_SHIPPING, type ShippingSettings } from '@/lib/shipping'
import axios from 'axios'
import { motion } from 'framer-motion'
import { CheckCircle, CreditCard, MapPin, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

type Step = 'address' | 'review' | 'payment' | 'success'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user }   = useAuth()
  const router     = useRouter()
  const [step, setStep]   = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [shipSettings, setShipSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING)

  useEffect(() => {
    axios.get('/api/store-settings')
      .then(({ data }) => setShipSettings({ shippingCharge: data.shippingCharge, freeShippingThreshold: data.freeShippingThreshold }))
      .catch(() => {})
  }, [])

  const shipping = calcShipping(subtotal, shipSettings)
  const total    = subtotal + shipping

  const [address, setAddress] = useState({
    name:     user?.name ?? '',
    phone:    '',
    line1:    '',
    locality: '',
    city:     '',
    state:    '',
    country:  'India',
    pincode:  '',
  })

  const set = (k: string, v: string) => setAddress((a) => ({ ...a, [k]: v }))

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (typeof window.Razorpay !== 'undefined') { resolve(true); return }
      const s = document.createElement('script')
      s.src   = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  const handlePayment = async (method?: string) => {
    setLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Payment gateway failed to load'); return }

      const { data: rzpOrder } = await axios.post('/api/payment/create-order', { amount: total })
      const { data: order }    = await axios.post('/api/orders', { shippingAddress: address, razorpayOrderId: rzpOrder.orderId })

      const options: Record<string, unknown> = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      rzpOrder.amount,
        currency:    'INR',
        name:        'Jasubhai Chappal',
        description: 'Footwear Order',
        order_id:    rzpOrder.orderId,
        prefill:     { name: address.name, email: user?.email, contact: address.phone },
        theme:       { color: '#f59e0b' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await axios.post('/api/payment/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           order.order._id,
            })
            clearCart()
            setStep('success')
          } catch {
            toast.error('Payment verification failed')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      // Pre-select UPI if chosen
      if (method === 'upi') {
        options.config = { display: { blocks: { upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } }, sequence: ['block.upi'], preferences: { show_default_blocks: false } } }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const steps: { key: Step; label: string; icon: typeof MapPin }[] = [
    { key: 'address', label: 'Address',  icon: MapPin },
    { key: 'review',  label: 'Review',   icon: ShoppingBag },
    { key: 'payment', label: 'Payment',  icon: CreditCard },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

          {step === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-100"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">Order Confirmed!</h2>
              <p className="text-gray-500 mb-2">Thank you for shopping with Jasubhai Chappal</p>
              <p className="text-gray-500 mb-8">You will receive a confirmation shortly</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => router.push('/orders')} className="btn-primary">View My Orders</button>
                <button onClick={() => router.push('/')} className="btn-outline">Continue Shopping</button>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Step Indicator */}
                <div className="flex items-center gap-0">
                  {steps.map(({ key, label, icon: Icon }, i) => (
                    <div key={key} className="flex items-center flex-1">
                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        step === key ? 'bg-amber-500 text-white' : steps.indexOf(steps.find(s => s.key === step)!) > i ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon size={16} /> {label}
                      </div>
                      {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
                    </div>
                  ))}
                </div>

                {/* Address Form */}
                {step === 'address' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                    <h2 className="font-bold text-lg text-gray-900">Delivery Address</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <input className="input-field col-span-2" placeholder="Full Name *" value={address.name} onChange={(e) => set('name', e.target.value)} required />
                      <input className="input-field col-span-2" placeholder="Phone Number *" value={address.phone} onChange={(e) => set('phone', e.target.value)} required />
                      <input className="input-field col-span-2" placeholder="Address Line 1 *" value={address.line1} onChange={(e) => set('line1', e.target.value)} required />
                      <input className="input-field col-span-2" placeholder="Locality / Area" value={address.locality} onChange={(e) => set('locality', e.target.value)} />
                      <input className="input-field" placeholder="City *" value={address.city} onChange={(e) => set('city', e.target.value)} required />
                      <input className="input-field" placeholder="State *" value={address.state} onChange={(e) => set('state', e.target.value)} required />
                      <input className="input-field" placeholder="Country *" value={address.country} onChange={(e) => set('country', e.target.value)} required />
                      <input className="input-field" placeholder="Pincode *" value={address.pincode} onChange={(e) => set('pincode', e.target.value)} required />
                    </div>
                    <button onClick={() => setStep('review')} className="btn-primary w-full">
                      Continue to Review
                    </button>
                  </motion.div>
                )}

                {/* Review */}
                {step === 'review' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-lg text-gray-900 mb-4">Order Review</h2>
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-sm">₹{Math.round(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2 text-sm mb-6">
                      <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{Math.round(subtotal)}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                      <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t"><span>Total</span><span>₹{Math.round(total)}</span></div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep('address')} className="btn-outline flex-1">Back</button>
                      <button onClick={() => setStep('payment')} className="btn-primary flex-1">Proceed to Pay</button>
                    </div>
                  </motion.div>
                )}

                {/* Payment */}
                {step === 'payment' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-lg text-gray-900 mb-4">Payment</h2>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                      <p className="text-gray-600 text-sm mb-1">Amount to pay</p>
                      <p className="text-4xl font-black text-gray-900">₹{Math.round(total)}</p>
                    </div>

                    {/* Payment options */}
                    <div className="space-y-3 mb-6">
                      {/* UPI */}
                      <motion.button
                        onClick={() => handlePayment('upi')}
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-4 p-4 border-2 border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100 rounded-xl transition-all disabled:opacity-60 text-left"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-lg font-black text-green-600">₹</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">Pay with UPI</p>
                          <p className="text-xs text-gray-500">GPay, PhonePe, Paytm, BHIM & more</p>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg border border-green-200">Popular</span>
                      </motion.button>

                      {/* Card / Netbanking */}
                      <motion.button
                        onClick={() => handlePayment()}
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 rounded-xl transition-all disabled:opacity-60 text-left"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CreditCard size={20} className="text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">Card / Net Banking / Wallet</p>
                          <p className="text-xs text-gray-500">Visa, Mastercard, all banks & wallets</p>
                        </div>
                      </motion.button>
                    </div>

                    {loading && (
                      <p className="text-center text-sm text-gray-500 mb-4 animate-pulse">Opening payment gateway...</p>
                    )}

                    <button onClick={() => setStep('review')} className="btn-outline w-full">Back</button>
                  </motion.div>
                )}
              </div>

              {/* Mini Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>{items.length} item(s)</span><span>₹{Math.round(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <div className="flex justify-between font-black text-gray-900 pt-2 border-t"><span>Total</span><span>₹{Math.round(total)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
