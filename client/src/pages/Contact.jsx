import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiOutlineMail, HiOutlineChatAlt2, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields.');
      return;
    }
    setSent(true);
    toast.success('Thank you! Your message has been sent to our support desk.');
  };

  return (
    <>
      <Helmet>
        <title>Contact Support — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-100 mb-2">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            Have questions about a book, download issues, or enterprise team licenses? We're here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="glass rounded-3xl p-6 border border-surface-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
                <HiOutlineMail className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-surface-100 text-sm">Email Support</h3>
              <p className="text-xs text-surface-400 leading-relaxed">
                Direct inquiry response within 24 hours:
              </p>
              <a href="mailto:support@brainbytebooks.com" className="text-xs font-semibold text-primary-400 hover:text-primary-300 block">
                support@brainbytebooks.com
              </a>
            </div>

            <div className="glass rounded-3xl p-6 border border-surface-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-accent-600/20 text-accent-400 flex items-center justify-center">
                <HiOutlineChatAlt2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-surface-100 text-sm">Community</h3>
              <p className="text-xs text-surface-400 leading-relaxed">
                Connect with authors and developers on our developer Discord and GitHub.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 glass rounded-3xl p-6 sm:p-8 border border-surface-800">
            {sent ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCheck className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-surface-100">Message Received!</h3>
                <p className="text-surface-400 text-sm max-w-sm mx-auto">
                  Our customer success team will review your inquiry and follow up at {formData.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Alex Taylor"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="alex@example.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Download token question / Enterprise purchase"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="How can we assist you today?"
                    className="input-field leading-relaxed resize-y"
                  />
                </div>

                <button type="submit" className="btn-primary py-3 px-8 text-sm font-semibold">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
