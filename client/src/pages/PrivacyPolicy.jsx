import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-12 border border-surface-800 space-y-8 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-100 mb-2">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-surface-400 text-sm">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-sm text-surface-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">1. Information We Collect</h2>
              <p>
                BrainByte Books collects necessary customer information to process digital e-book purchases and provide secure file delivery. This includes your name, email address, and order transaction identifiers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">2. Secure Payment Processing</h2>
              <p>
                All payments are processed securely via Razorpay payment gateway. BrainByte Books does not store or process your sensitive credit card numbers or banking passwords on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">3. Digital Download Security</h2>
              <p>
                Purchased digital e-books are stored in private cloud repositories (such as Amazon S3) or secure private server vaults. Download links use cryptographically signed, expiring tokens that restrict access strictly to authorized buyers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">4. Communications</h2>
              <p>
                We use your email address solely to send transaction receipts, secure download links, and critical product updates. We do not sell or rent your personal information to third parties.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">5. Contact</h2>
              <p>
                If you have questions about this Privacy Policy, please contact our privacy compliance team at support@brainbytebooks.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
