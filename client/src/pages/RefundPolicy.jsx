import { Helmet } from 'react-helmet-async';

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-12 border border-surface-800 space-y-8 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-100 mb-2">
              Refund <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-surface-400 text-sm">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-sm text-surface-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">1. Digital Nature of Products</h2>
              <p>
                BrainByte Books offers digital e-books in downloadable PDF format. Because our digital files are delivered immediately upon successful transaction completion, standard physical return policies do not apply.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">2. Eligible Circumstances for Refund</h2>
              <p>
                We gladly issue full refunds or replacement access under the following conditions within 7 days of purchase:
              </p>
              <ul className="list-disc list-inside space-y-1 text-surface-400 mt-2">
                <li>Accidental duplicate purchases of the exact same e-book title on the same account</li>
                <li>Corrupted or unreadable PDF files that our technical team cannot remediate</li>
                <li>Technical billing errors resulting in double charges by Razorpay</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">3. How to Request a Refund</h2>
              <p>
                Please email <strong className="text-primary-400">support@brainbytebooks.com</strong> with your Order ID, Razorpay Payment ID, and description of the issue. Our support team reviews all requests within 24–48 hours.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
