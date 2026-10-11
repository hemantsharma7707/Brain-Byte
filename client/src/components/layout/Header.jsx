import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineBookOpen, HiOutlineCog } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110">
              BB
            </div>
            <span className="font-display font-bold text-lg text-surface-100 hidden sm:block">
              BrainByte <span className="text-primary-400">Books</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-sm text-surface-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-surface-800/50">Home</Link>
            <Link to="/explore" className="px-4 py-2 text-sm text-surface-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-surface-800/50">Explore</Link>
            {user && (
              <Link to="/purchases" className="px-4 py-2 text-sm text-surface-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-surface-800/50">My Books</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="px-4 py-2 text-sm text-surface-300 hover:text-accent-400 transition-colors rounded-lg hover:bg-surface-800/50">
                <HiOutlineCog className="inline mr-1" />Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-surface-300 hover:text-primary-400 transition-colors">
              <HiOutlineShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/purchases" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 text-sm text-surface-300 hover:text-primary-400 transition-colors">
                  <HiOutlineUser className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-surface-400 hover:text-red-400 transition-colors" title="Logout">
                  <HiOutlineLogout className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-surface-300 hover:text-primary-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-surface-800/50 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-surface-300 hover:text-primary-400 rounded-lg hover:bg-surface-800/50 transition-colors">Home</Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-surface-300 hover:text-primary-400 rounded-lg hover:bg-surface-800/50 transition-colors">Explore</Link>
            {user && (
              <>
                <Link to="/purchases" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-surface-300 hover:text-primary-400 rounded-lg hover:bg-surface-800/50 transition-colors">
                  <HiOutlineBookOpen className="inline mr-2" />My Books
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-surface-300 hover:text-accent-400 rounded-lg hover:bg-surface-800/50 transition-colors">
                    <HiOutlineCog className="inline mr-2" />Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-red-400 rounded-lg hover:bg-surface-800/50 transition-colors">
                  <HiOutlineLogout className="inline mr-2" />Logout
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-primary-400 font-semibold rounded-lg hover:bg-surface-800/50 transition-colors">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
