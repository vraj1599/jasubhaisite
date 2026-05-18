import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Jasubhai Chappal – Comfort Footwear Starting ₹199',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomeClient />
      <Footer />
    </>
  )
}
