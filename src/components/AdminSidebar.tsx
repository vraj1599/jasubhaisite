'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, Plus, LogOut, X, Megaphone, Sparkles, Settings, Tags } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products',  icon: Package,         label: 'Products' },
  { href: '/admin/categories',icon: Tags,            label: 'Categories' },
  { href: '/admin/orders',    icon: ShoppingCart,    label: 'Orders' },
  { href: '/admin/users',     icon: Users,           label: 'Users' },
  { href: '/admin/banners',   icon: Megaphone,       label: 'Banners' },
  { href: '/admin/homepage',  icon: Sparkles,        label: 'Homepage' },
  { href: '/admin/settings',  icon: Settings,        label: 'Settings' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname   = usePathname()
  const { logout } = useAuth()

  const SidebarContent = () => (
    <aside className="w-64 flex-shrink-0 bg-gray-950 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">JC</span>
          </div>
          <div>
            <p className="font-black text-white text-sm leading-none">Admin Panel</p>
            <p className="font-medium text-amber-500 text-xs">Jasubhai Chappal</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 3 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {label}
              </motion.div>
            </Link>
          )
        })}

        <div className="pt-2 border-t border-gray-800 mt-2">
          <Link href="/admin/products/new" onClick={onClose}>
            <motion.div
              whileHover={{ x: 3 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
            >
              <Plus size={18} />
              Add Product
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => { logout(); onClose() }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
