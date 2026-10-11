import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineEye } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

const BookCard = ({ book }) => {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(book._id);

  return (
    <div className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 animate-fade-in">
      {/* Cover Image */}
      <Link to={`/book/${book._id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={book.coverImage?.startsWith('http') ? book.coverImage : `/${book.coverImage}`}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="btn-primary text-sm">
            <HiOutlineEye className="w-4 h-4" />
            View Details
          </span>
        </div>

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary-600/90 text-white backdrop-blur-sm">
          {book.category}
        </span>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/book/${book._id}`}>
          <h3 className="font-display font-semibold text-surface-100 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-surface-400 text-xs mb-3">{book.author}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold gradient-text">₹{book.price}</span>
          <button
            onClick={() => !inCart && addToCart(book)}
            disabled={inCart}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              inCart
                ? 'bg-primary-600/20 text-primary-400 cursor-default'
                : 'bg-surface-800 text-surface-300 hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-600/20'
            }`}
            title={inCart ? 'Already in cart' : 'Add to cart'}
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
