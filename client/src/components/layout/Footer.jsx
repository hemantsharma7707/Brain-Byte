import { Link } from 'react-router-dom';
import { HiOutlineBookOpen, HiOutlineMail, HiOutlineShieldCheck } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="border-t border-surface-800/50 bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                BB
              </div>
              <span className="font-display font-bold text-lg">
                BrainByte <span className="text-primary-400">Books</span>
              </span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed">
              Premium digital books for developers, designers, and tech enthusiasts. Learn from the best minds in tech.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <HiOutlineBookOpen className="w-4 h-4 text-primary-400" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Explore Books</Link></li>
              <li><Link to="/explore?category=Programming" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Programming</Link></li>
              <li><Link to="/explore?category=Web Development" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Web Development</Link></li>
              <li><Link to="/explore?category=AI & Machine Learning" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">AI & ML</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck className="w-4 h-4 text-primary-400" />
              Legal
            </h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <HiOutlineMail className="w-4 h-4 text-primary-400" />
              Contact
            </h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><a href="mailto:support@brainbytebooks.com" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">support@brainbytebooks.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-800/50 text-center">
          <p className="text-surface-500 text-sm">
            © {new Date().getFullYear()} BrainByte Books. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
