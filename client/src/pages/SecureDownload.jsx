import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineDownload, HiOutlineShieldCheck, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { downloadAPI } from '../services/api';

const SecureDownload = () => {
  const { token } = useParams();
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const fetchTokenInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await downloadAPI.getDownloadInfo(token);
      if (data.success) {
        setDownloadInfo(data.data);
      }
    } catch (err) {
      console.error('Download verification error:', err);
      setError(
        err.response?.data?.message ||
          'This download link is invalid, expired, or belongs to another user.'
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  // Live countdown timer for expiration
  useEffect(() => {
    if (!downloadInfo?.expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(downloadInfo.expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [downloadInfo?.expiresAt]);

  const handleDownloadFile = () => {
    setDownloading(true);
    toast.success('Your secure PDF download is starting...');

    // Trigger download via direct authenticated request
    const downloadUrl = `/api/download/${token}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Refresh token info after 2 seconds to update remaining downloads
    setTimeout(() => {
      setDownloading(false);
      fetchTokenInfo();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
        <div className="glass max-w-md w-full rounded-3xl p-8 text-center animate-scale-in">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-display text-lg font-bold text-surface-100">Verifying Security Token...</h2>
          <p className="text-surface-400 text-xs mt-1">Checking signature, expiry, and download limits</p>
        </div>
      </div>
    );
  }

  if (error || !downloadInfo) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
        <div className="glass max-w-md w-full rounded-3xl p-8 text-center border border-red-500/20 shadow-2xl animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
            <HiOutlineExclamationCircle className="w-8 h-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-surface-100 mb-2">Download Unauthorized</h2>
          <p className="text-surface-400 text-sm mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <Link to="/purchases" className="btn-primary w-full py-3">
              Go to My Library to Re-generate
            </Link>
            <Link to="/explore" className="btn-secondary w-full py-2.5 text-xs">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { book, downloadCount, maxDownloads, remainingDownloads } = downloadInfo;

  return (
    <>
      <Helmet>
        <title>{`Secure Download: ${book.title} — BrainByte Books`}</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <Link to="/purchases" className="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 transition-colors mb-6 text-sm">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to My Library
        </Link>

        <div className="glass rounded-3xl p-6 sm:p-10 border border-primary-500/20 shadow-2xl animate-scale-in">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-surface-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <HiOutlineShieldCheck className="w-5 h-5 shrink-0" />
              <span>Cryptographically Verified Link</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
              <HiOutlineClock className="w-4 h-4 shrink-0" />
              <span>Expires: {timeLeft}</span>
            </div>
          </div>

          {/* Book Display */}
          <div className="my-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-surface-800 shrink-0 shadow-xl border border-surface-700/50">
              <img
                src={book.coverImage?.startsWith('http') ? book.coverImage : `/${book.coverImage}`}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-primary-400 bg-primary-950/60 border border-primary-500/20 px-2.5 py-1 rounded-md inline-block mb-2">
                PDF Digital E-Book
              </span>
              <h1 className="font-display text-2xl font-bold text-surface-100 mb-1 leading-snug">
                {book.title}
              </h1>
              <p className="text-surface-400 text-sm mb-4">by {book.author}</p>

              <div className="flex flex-wrap gap-2 text-xs text-surface-300">
                <span className="px-3 py-1 rounded-lg bg-surface-900 border border-surface-800">
                  Remaining downloads: <strong className="text-emerald-400">{remainingDownloads}</strong> / {maxDownloads}
                </span>
                <span className="px-3 py-1 rounded-lg bg-surface-900 border border-surface-800">
                  Downloaded: {downloadCount} time(s)
                </span>
              </div>
            </div>
          </div>

          {/* Download Action */}
          <div className="space-y-4 pt-6 border-t border-surface-800">
            <button
              onClick={handleDownloadFile}
              disabled={downloading || remainingDownloads <= 0}
              className="btn-primary w-full py-4 text-base font-semibold shadow-xl shadow-primary-600/40 relative group overflow-hidden"
            >
              {downloading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Streaming Secure PDF...
                </span>
              ) : remainingDownloads <= 0 ? (
                <span>Download Limit Reached</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <HiOutlineDownload className="w-5 h-5" />
                  Download Complete PDF File Now
                </span>
              )}
            </button>

            <div className="p-4 rounded-2xl bg-surface-900/60 border border-surface-800 text-xs text-surface-400 space-y-2">
              <p className="font-semibold text-surface-300">Security & Fair-Use Note:</p>
              <p className="leading-relaxed">
                This document is delivered via our private digital vault. It is watermarked with your ownership details. Do not post or distribute this link publicly.
              </p>
              <p className="leading-relaxed">
                Need to download again in the future? You can easily generate a fresh access link directly from your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecureDownload;
