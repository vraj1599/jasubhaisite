import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductDetailClient from './ProductDetailClient'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <ProductDetailClient id={params.id} />
      <Footer />
    </>
  )
}
