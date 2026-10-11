import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';

// Helper to dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const [simulationData, setSimulationData] = useState(null);

  const completePaymentVerification = async (razorpayOrderId, paymentId, signature) => {
    try {
      toast.loading('Verifying payment signature securely...', { id: 'verify-toast' });
      const verifyRes = await paymentAPI.verifyPayment({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId || `pay_sim_${Date.now()}`,
        razorpay_signature: signature || 'sim_signature',
      });

      toast.dismiss('verify-toast');

      if (verifyRes.data.success) {
        clearCart();
        toast.success('Payment verified! Your books are ready.');
        navigate('/payment-success', {
          state: {
            orderId: verifyRes.data.data.orderId,
            downloads: verifyRes.data.data.downloads,
            items,
            totalAmount,
          },
        });
      } else {
        navigate('/payment-failure', {
          state: { error: verifyRes.data.message || 'Payment verification failed' },
        });
      }
    } catch (verifyErr) {
      toast.dismiss('verify-toast');
      navigate('/payment-failure', {
        state: {
          error:
            verifyErr.response?.data?.message ||
            'Payment verification encountered an unexpected error.',
        },
      });
    } finally {
      setProcessing(false);
      setSimulationData(null);
    }
  };

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      // 1. Create order on backend
      const payload = items.map((item) => ({ bookId: item._id, price: item.price }));
      const { data } = await paymentAPI.createOrder(payload);

      if (!data.success) {
        toast.error(data.message || 'Failed to initialize order');
        setProcessing(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, isSimulation } = data.data;

      // In simulation mode (or placeholder test keys), show the interactive Sandbox Simulator
      if (isSimulation || keyId === 'rzp_test_placeholder') {
        setProcessing(false);
        setSimulationData({ razorpayOrderId, amount, currency });
        return;
      }

      // 2. Open live Razorpay Checkout modal
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay payment SDK. Please check your internet connection.');
        setProcessing(false);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'BrainByte Books',
        description: `Order of ${items.length} Digital E-Book(s)`,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response) {
          await completePaymentVerification(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast('Payment modal was closed.', { icon: 'ℹ️' });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setProcessing(false);
        navigate('/payment-failure', {
          state: {
            error: response.error?.description || 'Payment was declined by payment gateway.',
            orderId: razorpayOrderId,
          },
        });
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Payment checkout error:', err);
      toast.error(err.response?.data?.message || 'Error initializing payment. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Secure Checkout — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Link to="/cart" className="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 transition-colors mb-6 text-sm">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-100">
              Secure <span className="gradient-text">Checkout</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">Review your order and complete payment via Razorpay</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <HiOutlineShieldCheck className="w-4 h-4" />
            256-Bit SSL Encrypted
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Items & Customer Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Details Box */}
            <div className="glass rounded-3xl p-6 border border-surface-800">
              <h2 className="font-display text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-600/30 text-primary-400 text-xs flex items-center justify-center font-bold">1</span>
                Customer Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-surface-800">
                  <span className="text-xs text-surface-400 block mb-0.5">Full Name</span>
                  <span className="font-medium text-surface-100">{user?.name}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-surface-800">
                  <span className="text-xs text-surface-400 block mb-0.5">Email (Download Recipient)</span>
                  <span className="font-medium text-surface-100">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="glass rounded-3xl p-6 border border-surface-800">
              <h2 className="font-display text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-600/30 text-primary-400 text-xs flex items-center justify-center font-bold">2</span>
                Items to Download ({items.length})
              </h2>
              <div className="divide-y divide-surface-800/60">
                {items.map((item) => (
                  <div key={item._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.coverImage?.startsWith('http') ? item.coverImage : `/${item.coverImage}`}
                        alt={item.title}
                        className="w-12 aspect-[3/4] rounded-lg object-cover bg-surface-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-medium text-surface-100 text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-surface-400">{item.author}</p>
                      </div>
                    </div>
                    <span className="font-bold text-surface-100 shrink-0">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="md:col-span-1">
            <div className="glass rounded-3xl p-6 border border-surface-700/60 sticky top-24">
              <h3 className="font-display text-lg font-bold text-surface-100 mb-4">Payment Summary</h3>

              <div className="space-y-3 text-sm text-surface-300 pb-4 border-b border-surface-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-surface-100 font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instant Delivery</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-base text-surface-100 pt-2 border-t border-surface-800/80">
                  <span>Total Due</span>
                  <span className="text-2xl gradient-text">₹{totalAmount}</span>
                </div>
              </div>

              <div className="my-5 p-3 rounded-xl bg-surface-900/60 border border-surface-800 text-xs space-y-2 text-surface-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <HiOutlineCheckCircle className="w-4 h-4 shrink-0" />
                  <span>Supported Payment Methods</span>
                </div>
                <p className="text-surface-400 leading-relaxed">
                  UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets via Razorpay.
                </p>
              </div>

              <button
                onClick={handlePayNow}
                disabled={processing}
                className="btn-primary w-full py-4 text-base font-semibold shadow-xl shadow-primary-600/40 relative overflow-hidden group"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Opening Payment...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <HiOutlineLockClosed className="w-5 h-5" />
                    Pay ₹{totalAmount} Now
                  </span>
                )}
              </button>

              <p className="text-[11px] text-surface-400 text-center mt-3">
                By completing this purchase, you agree to our Terms and Refund Policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Sandbox Test Simulator Modal */}
      {simulationData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass max-w-md w-full rounded-3xl p-6 sm:p-8 border border-primary-500/30 shadow-2xl animate-scale-in space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-800">
              <div className="flex items-center gap-2 text-primary-400 font-semibold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Razorpay Test Sandbox</span>
              </div>
              <button
                onClick={() => setSimulationData(null)}
                className="text-surface-400 hover:text-surface-200 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold">Total Payable</p>
              <h3 className="text-3xl font-display font-bold gradient-text">₹{totalAmount}</h3>
              <p className="text-xs text-surface-400">Order ID: <code className="text-surface-300">{simulationData.razorpayOrderId}</code></p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-900/80 border border-surface-800 text-xs text-surface-300 space-y-1.5">
              <div className="font-semibold text-surface-100 flex items-center gap-1.5">
                <span>⚡ Sandbox Simulation Active</span>
              </div>
              <p className="text-surface-400 leading-relaxed">
                Development test keys are active. You can simulate instant payment success to test the download tokens and digital library, or simulate payment rejection.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => completePaymentVerification(simulationData.razorpayOrderId)}
                disabled={processing}
                className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
              >
                <HiOutlineCheckCircle className="w-5 h-5" />
                Complete Test Payment (Success)
              </button>

              <button
                onClick={() => {
                  setSimulationData(null);
                  navigate('/payment-failure', {
                    state: { error: 'Simulated payment failure: Transaction was cancelled or declined by test issuer.' },
                  });
                }}
                disabled={processing}
                className="w-full py-2.5 text-xs text-red-400 hover:text-red-300 font-semibold hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20"
              >
                Simulate Payment Failure
              </button>

              <button
                onClick={() => setSimulationData(null)}
                disabled={processing}
                className="w-full py-2 text-xs text-surface-400 hover:text-surface-200 transition-colors"
              >
                Cancel and return to checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
