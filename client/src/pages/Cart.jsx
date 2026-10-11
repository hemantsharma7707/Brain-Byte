import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineTrash, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { items, removeFromCart, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart — BrainByte Books</title>
        </Helmet>
        <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
          <div className="glass max-w-md w-full rounded-3xl p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center text-3xl mx-auto mb-4 text-surface-400">
              <HiOutlineShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-100 mb-2">Your Cart is Empty</h2>
            <p className="text-surface-400 text-sm mb-6">
              Looks like you haven't added any e-books yet. Explore our curated catalog to find your next read!
            </p>
            <Link to="/explore" className="btn-primary w-full py-3">
              Explore Books <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${items.length}) — BrainByte Books`}</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-100">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">{items.length} digital item(s) ready for checkout</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-surface-800 hover:border-surface-700 transition-all animate-fade-in"
              >
                <Link to={`/book/${item._id}`} className="shrink-0 w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-surface-800">
                  <img
                    src={item.coverImage?.startsWith('http') ? item.coverImage : `/${item.coverImage}`}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[11px] font-semibold text-primary-400 bg-primary-950/60 border border-primary-500/20 px-2 py-0.5 rounded-md mb-1">
                    {item.category}
                  </span>
                  <Link to={`/book/${item._id}`}>
                    <h3 className="font-display font-semibold text-surface-100 text-base sm:text-lg hover:text-primary-400 transition-colors truncate">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-surface-400 text-xs sm:text-sm mt-0.5">by {item.author}</p>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <span>⚡ Instant PDF Download</span>
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end justify-between h-full py-1">
                  <span className="text-xl font-bold gradient-text">₹{item.price}</span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-surface-400 hover:text-red-400 hover:bg-surface-800/80 rounded-lg transition-colors mt-4"
                    title="Remove item"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 border border-surface-700/50 sticky top-24">
              <h2 className="font-display text-xl font-bold text-surface-100 mb-4 pb-4 border-b border-surface-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-surface-300 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-surface-100">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Digital Delivery</span>
                  <span className="font-medium text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (Included)</span>
                  <span className="font-medium text-surface-100">₹0</span>
                </div>
                <div className="pt-3 border-t border-surface-800 flex justify-between text-base font-bold text-surface-100">
                  <span>Total Amount</span>
                  <span className="text-2xl gradient-text">₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="btn-primary w-full py-3.5 text-base font-semibold shadow-lg shadow-primary-600/30"
              >
                Proceed to Checkout <HiOutlineArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 pt-4 border-t border-surface-800/80 text-xs text-surface-400 space-y-2">
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Razorpay 256-bit Encrypted Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary-400">🔒</span>
                  <span>Direct secure PDF delivery link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
