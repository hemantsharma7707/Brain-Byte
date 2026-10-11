import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineCheckCircle, HiOutlineDownload, HiOutlineBookOpen } from 'react-icons/hi';

const PaymentSuccess = () => {
  const location = useLocation();
  const { orderId, downloads = [], items = [] } = location.state || {};

  return (
    <>
      <Helmet>
        <title>Payment Successful — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-12 text-center border border-emerald-500/20 shadow-2xl animate-scale-in">
          {/* Success Check Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 animate-float">
            <HiOutlineCheckCircle className="w-12 h-12" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3">
            Payment Verified & Completed
          </span>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-100 mb-3">
            Thank You for Your Order!
          </h1>
          <p className="text-surface-300 text-base max-w-lg mx-auto mb-6">
            Your e-books are ready for immediate download. We've also dispatched a confirmation and download access details to your registered email.
          </p>

          {orderId && (
            <div className="inline-block px-4 py-2 rounded-xl bg-surface-900/80 border border-surface-800 text-xs text-surface-400 mb-8 font-mono">
              Order ID: <span className="text-surface-200 font-bold">{orderId}</span>
            </div>
          )}

          {/* Download Links Cards */}
          {downloads.length > 0 && (
            <div className="text-left my-8 space-y-3">
              <h3 className="font-display text-base font-semibold text-surface-200 mb-2">
                Your Instant Downloads:
              </h3>
              {downloads.map((dl, idx) => {
                const bookItem = items.find((i) => i._id === dl.bookId || i.book === dl.bookId) || items[idx] || {};
                return (
                  <div
                    key={dl.token}
                    className="p-4 rounded-2xl bg-surface-900/60 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-semibold text-surface-100 text-sm truncate">
                        {bookItem.title || 'Digital E-Book PDF'}
                      </h4>
                      <p className="text-xs text-surface-400 mt-0.5">
                        Token active for 24 hours (up to 5 downloads)
                      </p>
                    </div>
                    <Link
                      to={`/download/${dl.token}`}
                      className="btn-primary py-2.5 px-5 text-sm shrink-0 flex items-center justify-center gap-2"
                    >
                      <HiOutlineDownload className="w-4 h-4" />
                      Download PDF
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-surface-800">
            <Link to="/purchases" className="btn-secondary w-full sm:w-auto py-3 px-6">
              <HiOutlineBookOpen className="w-5 h-5" />
              View All My Purchased Books
            </Link>
            <Link to="/explore" className="btn-primary w-full sm:w-auto py-3 px-6">
              Explore More Books
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
