import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineArrowRight, HiOutlineSparkles, HiOutlineBookOpen, HiOutlineShieldCheck, HiOutlineLightningBolt } from 'react-icons/hi';
import { bookAPI } from '../services/api';
import BookCard from '../components/books/BookCard';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await bookAPI.getBooks({ limit: 8, sort: '-totalSales' });
        if (data.success) setFeaturedBooks(data.data);
      } catch (err) {
        console.error('Failed to fetch books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = [
    { name: 'Programming', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { name: 'Web Development', icon: '🌐', color: 'from-primary-500 to-violet-500' },
    { name: 'Data Science', icon: '📊', color: 'from-emerald-500 to-teal-500' },
    { name: 'AI & Machine Learning', icon: '🤖', color: 'from-amber-500 to-orange-500' },
    { name: 'DevOps', icon: '⚙️', color: 'from-red-500 to-pink-500' },
    { name: 'Cybersecurity', icon: '🔒', color: 'from-slate-500 to-zinc-400' },
  ];

  return (
    <>
      <Helmet>
        <title>BrainByte Books — Premium Digital Books for Developers</title>
        <meta name="description" content="Discover premium e-books on programming, web development, AI, and more. Instant digital downloads with secure access." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center hero-gradient overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                <HiOutlineSparkles className="w-4 h-4" />
                Premium Digital Library
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Level Up Your
                <span className="block gradient-text">Tech Skills</span>
              </h1>
              <p className="text-surface-400 text-lg max-w-lg mb-8 leading-relaxed">
                Curated collection of premium e-books from industry experts. Instant access, secure downloads, and knowledge that transforms your career.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/explore" className="btn-primary text-base py-3 px-8">
                  Explore Books
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/explore?category=Programming" className="btn-secondary text-base py-3 px-8">
                  Browse Categories
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10">
                <div>
                  <p className="text-2xl font-bold gradient-text">500+</p>
                  <p className="text-surface-400 text-sm">E-Books</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">50K+</p>
                  <p className="text-surface-400 text-sm">Readers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">4.9★</p>
                  <p className="text-surface-400 text-sm">Rating</p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex justify-center animate-fade-in">
              <div className="relative">
                <div className="w-80 h-[420px] rounded-2xl bg-gradient-to-br from-primary-600/20 to-accent-600/20 border border-primary-500/20 backdrop-blur-sm flex items-center justify-center animate-float">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="font-display text-xl font-bold text-surface-100 mb-2">Your Digital Library</h3>
                    <p className="text-surface-400 text-sm">Start reading in seconds</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-gradient-to-br from-accent-500 to-pink-600 flex items-center justify-center text-2xl animate-float shadow-lg shadow-accent-500/30" style={{ animationDelay: '0.5s' }}>
                  🚀
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-xl animate-float shadow-lg shadow-primary-500/30" style={{ animationDelay: '1s' }}>
                  ⚡
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Why Choose <span className="gradient-text">BrainByte</span></h2>
            <p className="text-surface-400 max-w-2xl mx-auto">Everything you need to accelerate your learning journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <HiOutlineLightningBolt className="w-7 h-7" />, title: 'Instant Access', desc: 'Download your e-books instantly after purchase. No waiting, no shipping.' },
              { icon: <HiOutlineShieldCheck className="w-7 h-7" />, title: 'Secure Downloads', desc: 'Your purchases are protected with encrypted download links and ownership verification.' },
              { icon: <HiOutlineBookOpen className="w-7 h-7" />, title: 'Expert Content', desc: 'Curated by industry professionals with real-world experience and deep expertise.' },
            ].map((feature, i) => (
              <div key={i} className="glass rounded-2xl p-6 glass-hover transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-surface-100 mb-2">{feature.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Browse <span className="gradient-text">Categories</span></h2>
              <p className="text-surface-400">Find books in your area of interest</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="glass rounded-2xl p-5 text-center glass-hover transition-all duration-300 group hover:scale-105"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-medium text-surface-300 group-hover:text-primary-400 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Popular <span className="gradient-text">Books</span></h2>
              <p className="text-surface-400">Most loved by our community</p>
            </div>
            <Link to="/explore" className="btn-secondary">
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 stagger-children">
              {featuredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-surface-400 text-lg">No books available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Start <span className="gradient-text">Learning?</span>
              </h2>
              <p className="text-surface-400 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of developers who are leveling up their skills with BrainByte Books.
              </p>
              <Link to="/explore" className="btn-primary text-base py-3 px-10">
                Get Started <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
