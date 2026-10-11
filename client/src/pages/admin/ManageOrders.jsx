import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 15 };
      if (status) params.status = status;

      const { data } = await adminAPI.getOrders(params);
      if (data.success) {
        setOrders(data.data);
        setPagination((prev) => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <Helmet>
        <title>Manage Customer Orders — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-100">
              Customer <span className="gradient-text">Orders</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">
              Complete transaction log, Razorpay payment verification IDs, and customer deliveries
            </p>
          </div>
          <button onClick={fetchOrders} className="btn-secondary py-2.5 px-4 text-xs self-start sm:self-auto">
            <HiOutlineRefresh className="w-4 h-4" />
            Refresh Orders
          </button>
        </div>

        {/* Filter bar */}
        <div className="glass rounded-2xl p-4 mb-6 border border-surface-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Status:</span>
            {['', 'paid', 'created'].map((st) => (
              <button
                key={st}
                onClick={() => { setStatus(st); setPagination((p) => ({ ...p, page: 1 })); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  status === st
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                }`}
              >
                {st === '' ? 'All Orders' : st.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-xs text-surface-400">Total: {pagination.total} orders</span>
        </div>

        {/* Orders Table */}
        <div className="glass rounded-3xl border border-surface-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-surface-400 text-sm">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-900/80 text-surface-400 uppercase tracking-wider border-b border-surface-800">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Customer</th>
                    <th className="py-4 px-6 font-semibold">Items</th>
                    <th className="py-4 px-6 font-semibold">Amount</th>
                    <th className="py-4 px-6 font-semibold">Payment Details</th>
                    <th className="py-4 px-6 font-semibold">Date</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-surface-200">{order.user?.name || 'Customer'}</p>
                        <p className="text-surface-400 text-[11px]">{order.user?.email}</p>
                      </td>

                      <td className="py-4 px-6 text-surface-300 max-w-xs truncate">
                        {order.items?.map((item) => item.title || item.book?.title).join(', ') || 'E-Books'}
                      </td>

                      <td className="py-4 px-6 font-bold text-surface-100 text-sm">
                        ₹{order.totalAmount}
                      </td>

                      <td className="py-4 px-6 font-mono text-[11px] text-surface-400">
                        {order.razorpayPaymentId ? (
                          <div>
                            <span className="text-emerald-400 block font-semibold">ID: {order.razorpayPaymentId}</span>
                            <span className="text-[10px] text-surface-500">Order: {order.razorpayOrderId}</span>
                          </div>
                        ) : (
                          <span>Order: {order.razorpayOrderId}</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-surface-400 text-[11px]">
                        {new Date(order.paidAt || order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-4 px-6">
                        {order.paymentStatus === 'paid' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            PAID
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-surface-800 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPagination((prev) => ({ ...prev, page: pg }))}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    pagination.page === pg
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageOrders;
