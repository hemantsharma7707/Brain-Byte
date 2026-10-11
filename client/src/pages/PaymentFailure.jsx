import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineExclamationCircle, HiOutlineRefresh, HiOutlineMail } from 'react-icons/hi';

const PaymentFailure = () => {
  const location = useLocation();
  const errorMsg = location.state?.error || 'Your payment transaction could not be completed.';

  return (
    <>
      <Helmet>
        <title>Payment Unsuccessful — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-12 text-center border border-red-500/20 shadow-2xl animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-6">
            <HiOutlineExclamationCircle className="w-12 h-12" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold tracking-wide uppercase mb-3">
            Transaction Not Completed
          </span>

          <h1 className="font-display text-3xl font-bold text-surface-100 mb-3">
            Payment Failed or Cancelled
          </h1>
          <p className="text-surface-300 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            {errorMsg}
          </p>

          <div className="p-4 rounded-2xl bg-surface-900/60 border border-surface-800 text-xs text-surface-400 max-w-md mx-auto mb-8 text-left space-y-1.5">
            <p className="font-semibold text-surface-300">Common troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your card limits or UPI app connectivity</li>
              <li>Ensure OTP was entered within the timeout period</li>
              <li>Verify that your bank account has sufficient funds</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/cart" className="btn-primary w-full sm:w-auto py-3 px-6">
              <HiOutlineRefresh className="w-5 h-5" />
              Return to Cart & Retry
            </Link>
            <Link to="/contact" className="btn-secondary w-full sm:w-auto py-3 px-6">
              <HiOutlineMail className="w-5 h-5" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailure;
