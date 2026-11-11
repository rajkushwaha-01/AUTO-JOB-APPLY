import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { resumeApi } from '../../api/resume';
import {
  Upload,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Sliders,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Find Jobs', path: '/jobs' },
    { label: 'Applications', path: '/applications' },
    { label: 'Resume / Profile', path: '/profile' },
    // { label: 'Automation', path: '/automation' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await resumeApi.uploadPdf(selectedFile);
      setUploadSuccess(res.message || 'Resume uploaded and parsed successfully!');
      await refreshUser();
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setUploadSuccess(null);
        navigate('/profile');
      }, 1200);
    } catch (err: any) {
      setUploadError(
        err.response?.data?.error || err.response?.data?.message || 'Failed to upload resume.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-yc-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-yc-orange rounded-[4px] flex items-center justify-center text-white text-xs font-bold leading-none select-none">
                A
              </div>
              <span className="font-bold text-sm tracking-tight text-yc-text group-hover:text-black">
                AUTO-JOB-APPLY
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-xs font-medium px-3 py-1.5 rounded-[4px] transition-colors relative ${
                        isActive
                          ? 'text-yc-text font-semibold'
                          : 'text-yc-text-secondary hover:text-yc-text hover:bg-yc-bg-secondary'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-yc-orange" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Upload Resume CTA */}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsUploadModalOpen(true)}
                  icon={<Upload className="w-3.5 h-3.5" />}
                  className="hidden sm:inline-flex"
                >
                  + Upload Resume
                </Button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-[4px] hover:bg-yc-bg-secondary border border-transparent hover:border-yc-border transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-yc-text text-white flex items-center justify-center text-[11px] font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-medium text-yc-text max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-yc-text-muted" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-52 bg-white border border-yc-border rounded-[4px] shadow-sm py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-2 border-b border-yc-border-subtle">
                          <p className="text-xs font-semibold text-yc-text truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-yc-text-secondary truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-yc-text hover:bg-yc-bg-secondary transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-yc-text-muted" />
                          Candidate Profile
                        </Link>
                        <Link
                          to="/automation"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-yc-text hover:bg-yc-bg-secondary transition-colors"
                        >
                          <Sliders className="w-3.5 h-3.5 text-yc-text-muted" />
                          Automation Settings
                        </Link>
                        <div className="border-t border-yc-border-subtle my-1" />
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-yc-error hover:bg-yc-error-bg transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Hamburger */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-[4px] text-yc-text hover:bg-yc-bg-secondary transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-yc-text" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-yc-border px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-[4px] text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-yc-bg-secondary text-yc-text font-bold border-l-2 border-yc-orange'
                      : 'text-yc-text-secondary hover:text-yc-text hover:bg-yc-bg-subtle'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsUploadModalOpen(true);
                }}
              >
                + Upload Resume PDF
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Upload Resume Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setUploadError(null);
            setUploadSuccess(null);
          }
        }}
        title="Upload Resume PDF"
        description="Extract structured skills, work history, and generate 768-dim semantic embeddings via Gemini AI."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isUploading}
              disabled={!selectedFile || isUploading}
              onClick={handleUploadSubmit}
            >
              Parse & Save to Cloud
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-yc-border rounded-[4px] p-6 text-center hover:border-yc-orange/60 transition-colors bg-yc-bg-secondary/40">
            <FileText className="w-8 h-8 text-yc-text-muted mx-auto mb-2" />
            <p className="text-xs font-medium text-yc-text">
              {selectedFile ? selectedFile.name : 'Click to select or drag & drop resume PDF'}
            </p>
            <p className="text-[11px] text-yc-text-secondary mt-1">
              Supports standard PDF documents up to 10MB
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="mt-3 block w-full text-xs text-yc-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-[4px] file:border-0 file:text-xs file:font-medium file:bg-white file:text-yc-text file:border-yc-border hover:file:bg-yc-bg-secondary cursor-pointer"
            />
          </div>

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 bg-yc-success-bg border border-yc-success-border rounded-[4px] text-xs text-yc-success">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-yc-error-bg border border-yc-error-border rounded-[4px] text-xs text-yc-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
