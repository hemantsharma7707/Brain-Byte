import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineDownload, HiOutlineBookOpen, HiOutlineRefresh, HiOutlineCalendar, HiOutlineArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getMyOrders();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load your purchase history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDownload = async (orderId, bookId) => {
    setGeneratingFor(`${orderId}-${bookId}`);
    try {
      // Regenerate / get active download token for this book & order
      const { data } = await orderAPI.regenerateToken(orderId, bookId);
      if (data.success && data.downloadToken) {
        // Navigate to secure download page
        navigate(`/download/${data.downloadToken.token}`);
      } else {
        toast.error('Could not generate download link.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating secure download link.');
    } finally {
      setGeneratingFor(null);
    }
  };

  // Extract all individual purchased books across orders
  const allPurchasedItems = [];
  orders.forEach((order) => {
    if (order.paymentStatus === 'paid' && order.items) {
      order.items.forEach((item) => {
        allPurchasedItems.push({
          orderId: order._id,
          paidAt: order.paidAt || order.createdAt,
          ...item,
        });
      });
    }
  });

  return (
    <>
      <Helmet>
        <title>My Digital Library — BrainByte Books</title>
        <meta name="description" content="Access and securely download your purchased digital e-books." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-100">
              My <span className="gradient-text">Library</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">
              Your purchased digital books and secure lifetime download access
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="btn-secondary self-start sm:self-auto py-2.5 px-4 text-xs"
            title="Refresh library"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-3xl p-5 space-y-4">
                <div className="skeleton aspect-[3/4] rounded-2xl" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : allPurchasedItems.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto my-12 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-4">
              <HiOutlineBookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-surface-100 mb-2">No Purchased Books Yet</h3>
            <p className="text-surface-400 text-sm mb-6">
              You haven't purchased any e-books yet. Explore our high-impact tech catalog to start learning.
            </p>
            <Link to="/explore" className="btn-primary w-full py-3">
              Explore Catalog <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {allPurchasedItems.map((item, idx) => {
              const bookData = typeof item.book === 'object' ? item.book : null;
              const bookId = bookData?._id || item.book;
              const title = bookData?.title || item.title || 'Digital E-Book';
              const author = bookData?.author || 'BrainByte Author';
              const coverImage = bookData?.coverImage;
              const isGenerating = generatingFor === `${item.orderId}-${bookId}`;

              return (
                <div
                  key={`${item.orderId}-${bookId}-${idx}`}
                  className="glass rounded-3xl p-5 border border-surface-800/80 hover:border-surface-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Book Cover */}
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-900 mb-4 relative shadow-lg">
                      {coverImage ? (
                        <img
                          src={coverImage.startsWith('http') ? coverImage : `/${coverImage}`}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-surface-800 to-surface-900">
                          <HiOutlineBookOpen className="w-12 h-12 text-primary-400 mb-2" />
                          <span className="text-xs font-semibold text-surface-300">{title}</span>
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-md">
                        Purchased
                      </span>
                    </div>

                    {/* Book Details */}
                    <h3 className="font-display font-semibold text-surface-100 text-base line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-surface-400 mb-3">by {author}</p>

                    <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-4">
                      <HiOutlineCalendar className="w-4 h-4 text-surface-500" />
                      <span>
                        Purchased on {new Date(item.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-surface-800">
                    <button
                      onClick={() => handleDownload(item.orderId, bookId)}
                      disabled={isGenerating}
                      className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating Link...
                        </span>
                      ) : (
                        <>
                          <HiOutlineDownload className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PurchaseHistory;
