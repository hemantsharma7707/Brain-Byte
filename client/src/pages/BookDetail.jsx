import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineShoppingCart, HiOutlineBookOpen, HiOutlineGlobe, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineStar, HiOutlineArrowLeft } from 'react-icons/hi';
import { bookAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(id);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await bookAPI.getBook(id);
        if (data.success) setBook(data.data);
      } catch (err) {
        console.error('Failed to fetch book:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton aspect-[3/4] rounded-2xl" />
          <div className="space-y-4 pt-8">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-5 w-1/3" />
            <div className="skeleton h-10 w-1/4" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📖</p>
          <h2 className="text-xl font-bold text-surface-200 mb-2">Book Not Found</h2>
          <Link to="/explore" className="btn-primary mt-4">Browse Books</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${book.title} — BrainByte Books`}</title>
        <meta name="description" content={book.description?.substring(0, 160)} />
      </Helmet>

      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/explore" className="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 transition-colors mb-8">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
            {/* Cover */}
            <div className="relative group">
              <div className="glass rounded-2xl p-6 md:p-10">
                <img
                  src={book.coverImage?.startsWith('http') ? book.coverImage : `/${book.coverImage}`}
                  alt={book.title}
                  className="w-full max-w-sm mx-auto rounded-xl shadow-2xl shadow-primary-500/10 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* Sample preview badge */}
              <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-2 text-sm">
                <HiOutlineDocumentText className="inline w-4 h-4 mr-1 text-primary-400" />
                {book.samplePages} sample pages available
              </div>
            </div>

            {/* Info */}
            <div className="py-4">
              <span className="inline-block px-3 py-1 rounded-lg bg-primary-600/20 text-primary-400 text-sm font-medium mb-4">
                {book.category}
              </span>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-surface-100 mb-2">
                {book.title}
              </h1>

              <p className="text-surface-400 text-lg mb-4">by <span className="text-surface-200">{book.author}</span></p>

              {/* Rating */}
              {book.ratings?.average > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <HiOutlineStar
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(book.ratings.average) ? 'text-amber-400 fill-amber-400' : 'text-surface-600'}`}
                      />
                    ))}
                  </div>
                  <span className="text-surface-400 text-sm">({book.ratings.count} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold gradient-text">₹{book.price}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => !inCart && addToCart(book)}
                  disabled={inCart}
                  className={`${inCart ? 'btn-secondary cursor-default' : 'btn-primary'} py-3 px-8 text-base`}
                >
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
                {inCart && (
                  <Link to="/cart" className="btn-primary py-3 px-8 text-base">
                    Go to Cart
                  </Link>
                )}
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {book.pages && (
                  <div className="glass rounded-xl p-4">
                    <HiOutlineBookOpen className="w-5 h-5 text-primary-400 mb-1" />
                    <p className="text-surface-400 text-xs">Pages</p>
                    <p className="text-surface-100 font-semibold">{book.pages}</p>
                  </div>
                )}
                {book.language && (
                  <div className="glass rounded-xl p-4">
                    <HiOutlineGlobe className="w-5 h-5 text-primary-400 mb-1" />
                    <p className="text-surface-400 text-xs">Language</p>
                    <p className="text-surface-100 font-semibold">{book.language}</p>
                  </div>
                )}
                {book.publishedDate && (
                  <div className="glass rounded-xl p-4">
                    <HiOutlineCalendar className="w-5 h-5 text-primary-400 mb-1" />
                    <p className="text-surface-400 text-xs">Published</p>
                    <p className="text-surface-100 font-semibold">{new Date(book.publishedDate).getFullYear()}</p>
                  </div>
                )}
                {book.isbn && (
                  <div className="glass rounded-xl p-4">
                    <HiOutlineDocumentText className="w-5 h-5 text-primary-400 mb-1" />
                    <p className="text-surface-400 text-xs">ISBN</p>
                    <p className="text-surface-100 font-semibold text-xs">{book.isbn}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display font-semibold text-surface-200 mb-3 text-lg">About This Book</h2>
                <p className="text-surface-400 leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>

              {/* Tags */}
              {book.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-surface-800 text-surface-400 text-xs">
                      #{tag}
                    </span>
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

export default BookDetail;
