import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineCloud, HiOutlineDatabase } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getBooks();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      toast.error('Failed to load books catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" and its private PDF file?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { data } = await adminAPI.deleteBook(id);
      if (data.success) {
        toast.success(`"${title}" deleted successfully`);
        setBooks((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage E-Books — BrainByte Books</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-100">
              Manage <span className="gradient-text">E-Books</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">
              {books.length} e-book title(s) in catalog with secure private PDF storage
            </p>
          </div>
          <Link to="/admin/books/new" className="btn-primary py-2.5 px-5 text-sm font-semibold self-start sm:self-auto">
            <HiOutlinePlus className="w-5 h-5" />
            Upload New E-Book
          </Link>
        </div>

        {/* Search bar */}
        <div className="glass rounded-2xl p-4 mb-6 border border-surface-800">
          <div className="relative max-w-md">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, author, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 py-2 text-sm"
            />
          </div>
        </div>

        {/* Table of Books */}
        <div className="glass rounded-3xl border border-surface-800 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-surface-400 text-sm">No e-books match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-900/80 text-surface-400 uppercase tracking-wider border-b border-surface-800">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Book Info</th>
                    <th className="py-4 px-6 font-semibold">Category</th>
                    <th className="py-4 px-6 font-semibold">Price</th>
                    <th className="py-4 px-6 font-semibold">PDF Storage</th>
                    <th className="py-4 px-6 font-semibold">Sales</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-surface-800/30 transition-colors">
                      {/* Cover & Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverImage?.startsWith('http') ? book.coverImage : `/${book.coverImage}`}
                            alt={book.title}
                            className="w-12 aspect-[3/4] rounded-lg object-cover bg-surface-800 shrink-0 shadow-md"
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-surface-100 text-sm truncate max-w-xs">
                              {book.title}
                            </h4>
                            <p className="text-surface-400 text-xs mt-0.5">{book.author}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-surface-800 text-surface-300 font-medium">
                          {book.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-surface-100 text-sm">
                        ₹{book.price}
                      </td>

                      {/* Storage Type */}
                      <td className="py-4 px-6">
                        {book.storageType === 's3' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-[11px]">
                            <HiOutlineCloud className="w-3.5 h-3.5" />
                            Amazon S3 (Private)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-semibold text-[11px]">
                            <HiOutlineDatabase className="w-3.5 h-3.5" />
                            Local Vault (Private)
                          </span>
                        )}
                      </td>

                      {/* Sales */}
                      <td className="py-4 px-6 font-semibold text-surface-300">
                        {book.totalSales || 0} copies
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/admin/books/edit/${book._id}`}
                          className="p-2 inline-flex items-center justify-center rounded-lg bg-surface-800 hover:bg-primary-600/30 text-surface-300 hover:text-primary-300 transition-colors"
                          title="Edit Book"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(book._id, book.title)}
                          disabled={deletingId === book._id}
                          className="p-2 inline-flex items-center justify-center rounded-lg bg-surface-800 hover:bg-red-500/20 text-surface-300 hover:text-red-400 transition-colors"
                          title="Delete Book"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageBooks;
