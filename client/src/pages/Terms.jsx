import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>{'Terms & Conditions — BrainByte Books'}</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-12 border border-surface-800 space-y-8 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-100 mb-2">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-surface-400 text-sm">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-sm text-surface-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">1. Acceptance of Terms</h2>
              <p>
                By accessing BrainByte Books or purchasing digital goods from our platform, you agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">2. Digital Product License</h2>
              <p>
                Upon verified payment, you are granted a non-exclusive, non-transferable personal license to view, read, and download the purchased e-book for personal educational and reference purposes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">3. Redistribution Prohibition</h2>
              <p>
                Unauthorized copying, sharing, torrenting, resale, or public hosting of purchased PDF documents or token URLs is strictly prohibited and constitutes copyright infringement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-surface-100">4. Download Availability</h2>
              <p>
                BrainByte Books provides lifetime purchase history access. Tokens expire every 24 hours for security but can be re-generated on demand from your account dashboard.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
