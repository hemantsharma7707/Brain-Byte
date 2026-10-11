import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineBookOpen, HiOutlineCurrencyRupee, HiOutlineShoppingBag, HiOutlineUsers, HiOutlinePlus, HiOutlineArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-3xl p-6 h-32 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const {
    totalBooks = 0,
    totalOrders = 0,
    totalUsers = 0,
    totalRevenue = 0,
    recentOrders = [],
    topBooks = [],
  } = stats || {};

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-100">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">
              Store overview, digital e-book inventory, and revenue analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/books/new" className="btn-primary py-2.5 px-4 text-sm font-semibold">
              <HiOutlinePlus className="w-5 h-5" />
              Upload New E-Book
            </Link>
            <Link to="/admin/books" className="btn-secondary py-2.5 px-4 text-sm font-semibold">
              Manage Books
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass rounded-3xl p-6 border border-surface-800/80 hover:border-surface-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <HiOutlineCurrencyRupee className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold gradient-text">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-surface-400 mt-2">Verified Razorpay payments</p>
          </div>

          <div className="glass rounded-3xl p-6 border border-surface-800/80 hover:border-surface-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Paid Orders</span>
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                <HiOutlineShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-surface-100">{totalOrders}</div>
            <p className="text-xs text-surface-400 mt-2">Digital purchases delivered</p>
          </div>

          <div className="glass rounded-3xl p-6 border border-surface-800/80 hover:border-surface-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total E-Books</span>
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center">
                <HiOutlineBookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-surface-100">{totalBooks}</div>
            <p className="text-xs text-surface-400 mt-2">In catalog with private PDF storage</p>
          </div>

          <div className="glass rounded-3xl p-6 border border-surface-800/80 hover:border-surface-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Registered Readers</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-surface-100">{totalUsers}</div>
            <p className="text-xs text-surface-400 mt-2">Customer accounts</p>
          </div>
        </div>

        {/* Recent Orders & Top Books */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-surface-800/80">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-800">
              <h2 className="font-display text-lg font-bold text-surface-100">Recent Customer Purchases</h2>
              <Link to="/admin/orders" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-center text-surface-400 py-8 text-sm">No orders recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-surface-400 uppercase tracking-wider border-b border-surface-800/60 pb-2">
                    <tr>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/40">
                    {recentOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-surface-800/30">
                        <td className="py-3">
                          <p className="font-semibold text-surface-200">{ord.user?.name || 'Customer'}</p>
                          <p className="text-surface-400 text-[11px] truncate max-w-[140px]">{ord.user?.email}</p>
                        </td>
                        <td className="py-3 text-surface-300">
                          {ord.items?.map((it) => it.title || it.book?.title).join(', ') || 'E-Books'}
                        </td>
                        <td className="py-3 font-bold text-surface-100">₹{ord.totalAmount}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            PAID
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Selling Books */}
          <div className="lg:col-span-1 glass rounded-3xl p-6 border border-surface-800/80">
            <h2 className="font-display text-lg font-bold text-surface-100 mb-6 pb-4 border-b border-surface-800">
              Top Selling Titles
            </h2>

            {topBooks.length === 0 ? (
              <p className="text-center text-surface-400 py-8 text-sm">No sales data recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {topBooks.map((b, i) => (
                  <div key={b._id} className="flex items-center gap-3">
                    <span className="w-6 text-center font-display font-bold text-surface-400 text-sm">
                      #{i + 1}
                    </span>
                    <img
                      src={b.coverImage?.startsWith('http') ? b.coverImage : `/${b.coverImage}`}
                      alt={b.title}
                      className="w-10 aspect-[3/4] rounded-lg object-cover bg-surface-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-surface-100 text-xs truncate">{b.title}</h4>
                      <p className="text-[11px] text-surface-400">{b.author}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-primary-400 text-xs">{b.totalSales || 0} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
