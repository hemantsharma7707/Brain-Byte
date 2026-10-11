import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineDocumentText, HiOutlinePhotograph, HiOutlineCloud } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminAPI, bookAPI } from '../../services/api';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'AI & Machine Learning',
  'Mobile Development',
  'DevOps',
  'Cybersecurity',
  'Database',
  'Cloud Computing',
  'Software Engineering',
  'Design',
  'Business',
  'Other',
];

const AddEditBook = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: 'Programming',
    isbn: '',
    pages: '',
    language: 'English',
    samplePages: '10',
    tags: '',
    isAvailable: true,
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState({ name: '', size: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const fetchBook = useCallback(async () => {
    try {
      const { data } = await bookAPI.getBook(id);
      if (data.success) {
        const b = data.data;
        setFormData({
          title: b.title || '',
          author: b.author || '',
          description: b.description || '',
          price: b.price !== undefined ? b.price.toString() : '',
          category: b.category || 'Programming',
          isbn: b.isbn || '',
          pages: b.pages ? b.pages.toString() : '',
          language: b.language || 'English',
          samplePages: b.samplePages ? b.samplePages.toString() : '10',
          tags: b.tags ? b.tags.join(', ') : '',
          isAvailable: b.isAvailable !== false,
        });
        if (b.coverImage) {
          setCoverPreview(b.coverImage.startsWith('http') ? b.coverImage : `/${b.coverImage}`);
        }
      }
    } catch {
      toast.error('Failed to load book data for editing.');
      navigate('/admin/books');
    } finally {
      setFetching(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchBook();
    }
  }, [isEdit, fetchBook]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Cover file must be an image (JPEG, PNG, WebP).');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Selected file must be a valid PDF document.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('PDF file size cannot exceed 50 MB.');
        return;
      }
      setPdfFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setPdfInfo({ name: file.name, size: `${sizeMB} MB` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!isEdit && !coverFile) {
      toast.error('Please upload a cover image for the book.');
      return;
    }

    if (!isEdit && !pdfFile) {
      toast.error('Please upload the private PDF file for this e-book.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    if (formData.isbn) data.append('isbn', formData.isbn);
    if (formData.pages) data.append('pages', formData.pages);
    if (formData.language) data.append('language', formData.language);
    if (formData.samplePages) data.append('samplePages', formData.samplePages);
    if (formData.tags) data.append('tags', formData.tags);
    data.append('isAvailable', formData.isAvailable);

    if (coverFile) {
      data.append('coverImage', coverFile);
    }
    if (pdfFile) {
      data.append('pdfFile', pdfFile);
    }

    try {
      if (isEdit) {
        const res = await adminAPI.updateBook(id, data);
        if (res.data.success) {
          toast.success('Book updated successfully!');
          navigate('/admin/books');
        }
      } else {
        const res = await adminAPI.createBook(data);
        if (res.data.success) {
          toast.success('E-Book created and stored securely in vault!');
          navigate('/admin/books');
        }
      }
    } catch (err) {
      console.error('Save book error:', err);
      toast.error(err.response?.data?.message || 'Failed to save e-book.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${isEdit ? 'Edit E-Book' : 'Upload New E-Book'} — BrainByte Books`}</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link to="/admin/books" className="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 transition-colors mb-6 text-sm">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Book Management
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-100">
            {isEdit ? 'Edit' : 'Upload'} <span className="gradient-text">E-Book</span>
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            {isEdit
              ? 'Update title information, metadata, or replace PDF file'
              : 'Add a new digital product to the catalog with private cloud/server PDF vaulting'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Core Details */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-surface-800 space-y-6">
            <h2 className="font-display text-lg font-semibold text-surface-100 pb-3 border-b border-surface-800">
              1. Book Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Book Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Mastering Modern React 19"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Author Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Jane Smith"
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="input-field text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Price (INR ₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 499"
                  min="0"
                  step="1"
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Comprehensive overview of topics covered, prerequisites, and learning outcomes..."
                required
                className="input-field leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Section 2: File Uploads (PDF & Cover) */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-surface-800 space-y-6">
            <h2 className="font-display text-lg font-semibold text-surface-100 pb-3 border-b border-surface-800 flex items-center justify-between">
              <span>2. Media & Secure PDF Files</span>
              <span className="text-xs font-normal text-amber-400 flex items-center gap-1">
                <HiOutlineCloud className="w-4 h-4" />
                Amazon S3 / Private Vault
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Cover Image {!isEdit && <span className="text-red-400">*</span>}
                </label>
                <div className="p-4 rounded-2xl bg-surface-900/60 border-2 border-dashed border-surface-700 hover:border-primary-500 transition-colors text-center">
                  {coverPreview ? (
                    <div className="space-y-3">
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="w-32 aspect-[3/4] object-cover rounded-xl mx-auto shadow-lg"
                      />
                      <label className="btn-secondary py-1.5 px-3 text-xs cursor-pointer inline-block">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-6">
                      <HiOutlinePhotograph className="w-10 h-10 text-surface-400 mx-auto mb-2" />
                      <span className="text-xs text-primary-400 font-semibold block">Click to select cover image</span>
                      <span className="text-[11px] text-surface-500">PNG, JPG, WebP (ratio 3:4 recommended)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Private PDF Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  E-Book PDF File {!isEdit && <span className="text-red-400">*</span>}
                </label>
                <div className="p-4 rounded-2xl bg-surface-900/60 border-2 border-dashed border-surface-700 hover:border-primary-500 transition-colors text-center h-full flex flex-col justify-center">
                  {pdfInfo.name ? (
                    <div className="space-y-2 py-4">
                      <HiOutlineDocumentText className="w-10 h-10 text-emerald-400 mx-auto" />
                      <p className="text-xs font-semibold text-surface-100 truncate max-w-xs mx-auto">
                        {pdfInfo.name}
                      </p>
                      <p className="text-[11px] text-surface-400">{pdfInfo.size}</p>
                      <label className="btn-secondary py-1.5 px-3 text-xs cursor-pointer inline-block mt-2">
                        Replace PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-6">
                      <HiOutlineDocumentText className="w-10 h-10 text-surface-400 mx-auto mb-2" />
                      <span className="text-xs text-primary-400 font-semibold block">
                        {isEdit ? 'Upload New PDF (leaves unchanged if omitted)' : 'Click to select private PDF file'}
                      </span>
                      <span className="text-[11px] text-surface-500">Max size 50 MB • Stored privately</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Metadata & Specifications */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-surface-800 space-y-6">
            <h2 className="font-display text-lg font-semibold text-surface-100 pb-3 border-b border-surface-800">
              3. Metadata & Settings
            </h2>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Total Pages
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  placeholder="e.g. 340"
                  min="1"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Sample Pages
                </label>
                <input
                  type="number"
                  name="samplePages"
                  value={formData.samplePages}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="1"
                  max="50"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  placeholder="English"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  ISBN (Optional)
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="978-3-16-148410-0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="React, Frontend, WebDev, JavaScript"
                  className="input-field"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 bg-surface-800 border-surface-700"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-surface-200 cursor-pointer">
                Available for immediate sale & download in customer store
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link to="/admin/books" className="btn-secondary py-3 px-6">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-8 text-base font-semibold shadow-lg shadow-primary-600/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving E-Book...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <HiOutlineCheck className="w-5 h-5" />
                  {isEdit ? 'Save Changes' : 'Upload E-Book to Vault'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddEditBook;
