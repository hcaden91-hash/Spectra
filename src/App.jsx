import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SiteConfigProvider } from './context/SiteConfigContext'
import { AuthProvider } from './context/AuthContext'
import { ProductsProvider } from './context/ProductsContext'
import { CartProvider } from './context/CartContext'
import { isSupabaseConfigured } from './lib/supabase'
import { ADMIN_ROUTE, ADMIN_SETUP_ROUTE } from './config'

import ScrollToTop from './components/ScrollToTop'
import SetupNotice from './components/SetupNotice'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import AdminSetup from './pages/AdminSetup'
import AdminPanel from './pages/AdminPanel'
import NotFound from './pages/NotFound'

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <SiteConfigProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Catalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<VerifyEmail />} />
                    <Route path={ADMIN_SETUP_ROUTE} element={<AdminSetup />} />
                    <Route
                      path={ADMIN_ROUTE}
                      element={
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      }
                    />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </main>
                <Footer />
                <CartDrawer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </SiteConfigProvider>
  )
}
