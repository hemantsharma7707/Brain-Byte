import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';
import { bookAPI } from '../services/api';
import BookCard from '../components/books/BookCard';

const CATEGORIES = [
  'All', 'Programming', 'Web Development', 'Data Science', 'AI & Machine Learning',
  'Mobile Development', 'DevOps', 'Cybersecurity', 'Database', 'Cloud Computing',
  'Software Engineering', 'Design', 'Business',
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('-createdAt');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'All';
    const urlSearch = searchParams.get('search') || '';
    setCategory(urlCategory);
    setSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    fetchBooks();
  }, [category, sort, pagination.page]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 12, sort };
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();

      const { data } = await bookAPI.getBooks(params);
      if (data.success) {
        setBooks(data.data);
        setPagination((prev) => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchBooks();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPagination((prev) => ({ ...prev, page: 1 }));
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <Helmet>
        <title>Explore Books — BrainByte Books</title>
        <meta name="description" content="Browse our collection of premium e-books on programming, web development, data science, and more." />
      </Helmet>

      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="hero-gradient py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Explore <span className="gradient-text">Books</span>
            </h1>
            <p className="text-surface-400 mb-8">Discover your next great read</p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-12 py-3"
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(''); setPagination(p => ({...p, page: 1})); setTimeout(fetchBooks, 0); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary py-3">Search</button>
              <button
                type="button"
                className="btn-secondary py-3 md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <HiOutlineFilter className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
              <div className="glass rounded-2xl p-5 sticky top-24">
                <h3 className="font-semibold text-surface-200 mb-4">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        category === cat
                          ? 'bg-primary-600/20 text-primary-400 font-medium'
                          : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-surface-800">
                  <h3 className="font-semibold text-surface-200 mb-4">Sort By</h3>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-totalSales">Most Popular</option>
                    <option value="title">Title: A-Z</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Book Grid */}
            <div className="flex-1">
              {!loading && (
                <p className="text-surface-400 text-sm mb-6">
                  Showing {books.length} of {pagination.total} books
                  {category !== 'All' && <span> in <strong className="text-primary-400">{category}</strong></span>}
                </p>
              )}

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
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
              ) : books.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                  {books.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">📭</p>
                  <p className="text-surface-300 text-lg font-medium mb-2">No books found</p>
                  <p className="text-surface-400">Try adjusting your search or filter</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination((prev) => ({ ...prev, page }))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        pagination.page === page
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;
