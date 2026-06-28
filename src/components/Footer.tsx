'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  const [categories, setCategories] = useState<string[]>(['Sandals', 'Chappals', 'Kolhapuri', 'Mojaris', 'Sports', 'Kids'])

  useEffect(() => {
    axios.get('/api/categories')
      .then(({ data }) => setCategories((data.categories ?? []).map((c: { name: string }) => c.name)))
      .catch(() => {})
  }, [])

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">JC</span>
              </div>
              <div>
                <p className="font-black text-white text-lg leading-none">Jasubhai</p>
                <p className="font-medium text-amber-500 text-xs tracking-widest uppercase">Chappal</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Crafting comfortable, durable Indian footwear since 1985. Walk in style with every step.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Icon size={16} className="text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/products?category=${cat}`} className="hover:text-amber-400 transition-colors duration-200">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm">
              {['My Orders', 'Returns & Exchanges', 'Size Guide', 'Shipping Policy', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-amber-400 transition-colors duration-200">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span>123, Chappal Market, Kolhapur, Maharashtra 416001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-amber-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-amber-400 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-amber-500 flex-shrink-0" />
                <a href="mailto:support@jasubhaichappal.com" className="hover:text-amber-400 transition-colors">support@jasubhaichappal.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Jasubhai Chappal. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Payments secured by</span>
            <span className="font-semibold text-blue-400">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
