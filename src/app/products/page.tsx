import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = { title: 'All Products' }

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <ProductsClient />
      <Footer />
    </>
  )
}
