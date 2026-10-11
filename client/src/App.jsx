import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';

// Lazy-loaded Customer Pages
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const PurchaseHistory = lazy(() => import('./pages/PurchaseHistory'));
const SecureDownload = lazy(() => import('./pages/SecureDownload'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Lazy-loaded Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageBooks = lazy(() => import('./pages/admin/ManageBooks'));
const AddEditBook = lazy(() => import('./pages/admin/AddEditBook'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));

// Lazy-loaded Legal & Support Pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Contact = lazy(() => import('./pages/Contact'));

// Page loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-surface-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
      <div className="glass max-w-md w-full rounded-3xl p-8 text-center animate-scale-in">
        <span className="text-6xl block mb-4">🔍</span>
        <h1 className="font-display text-2xl font-bold text-surface-100 mb-2">Page Not Found</h1>
        <p className="text-surface-400 text-sm mb-6">
          The page you're searching for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary w-full py-3">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-surface-950 text-surface-100 antialiased selection:bg-primary-600 selection:text-white">
              <Header />

              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Store Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/book/:id" element={<BookDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Legal & Support */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/refund" element={<RefundPolicy />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Protected Customer Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment-success"
                      element={
                        <ProtectedRoute>
                          <PaymentSuccess />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/payment-failure" element={<PaymentFailure />} />
                    <Route
                      path="/purchases"
                      element={
                        <ProtectedRoute>
                          <PurchaseHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/download/:token"
                      element={
                        <ProtectedRoute>
                          <SecureDownload />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Only Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <Dashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/books"
                      element={
                        <AdminRoute>
                          <ManageBooks />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/books/new"
                      element={
                        <AdminRoute>
                          <AddEditBook />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/books/edit/:id"
                      element={
                        <AdminRoute>
                          <AddEditBook />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminRoute>
                          <ManageOrders />
                        </AdminRoute>
                      }
                    />

                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: 'toast-custom',
                  style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
