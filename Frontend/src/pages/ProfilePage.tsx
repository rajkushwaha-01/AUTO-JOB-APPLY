import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { resumeApi } from '../api/resume';
import { Card, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  User,
  Award,
  Languages,
  Eye,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileCheck,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resume = user?.resume;
  const hasResume = !!resume;

  // Handle in-browser PDF preview via modal
  const handleOpenPreview = async () => {
    if (!resume?.pdfFileId) return;
    setIsLoadingPreview(true);
    try {
      const blob = await resumeApi.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Error fetching resume preview:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  // Handle direct PDF file download
  const handleDownloadPdf = async () => {
    if (!resume?.pdfFileId) return;
    setIsDownloading(true);
    try {
      const blob = await resumeApi.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(resume.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading resume PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Please select a valid PDF document.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
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
      }, 1400);
    } catch (err: any) {
      setUploadError(
        err.response?.data?.error || err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const skillsByCategory = resume?.skillsByCategory || {};
  const hasCategorizedSkills = Object.keys(skillsByCategory).length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-yc-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-yc-text">
              {resume?.fullName || user?.name || 'Candidate Profile'}
            </h1>
            {/* {hasResume && (
              <Badge variant="success" size="sm" className="hidden sm:inline-flex">
                <FileCheck className="w-3 h-3" /> Resume Active
              </Badge>
            )} */}
          </div>
          {/* <p className="text-xs text-yc-text-secondary mt-1">
            Manage your verified credentials, extracted resume details, and AI matching vector profile.
          </p> */}
        </div>

        <div className="flex items-center gap-2">
          {hasResume && resume?.pdfFileId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPreview}
                isLoading={isLoadingPreview}
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Preview PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                isLoading={isDownloading}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            {hasResume ? 'Update Resume PDF' : 'Upload Resume PDF'}
          </Button>
        </div>
      </div>

      {!hasResume ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No Resume PDF on File"
          description="Upload your resume to extract contact details, categorized skills, work history, and calculate 768-dim embeddings for automatic job matching."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsUploadModalOpen(true)}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload PDF Resume
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Metadata, Verified Contacts & ATS Stats) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Active Cloud Document Card */}
            <Card className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-[4px] bg-yc-bg-secondary border border-yc-border text-yc-text shrink-0">
                  <User className="w-6 h-6 text-yc-orange" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-yc-text truncate">
                    {resume?.fullName ? `${resume.fullName}` : user?.name || 'Candidate Resume'}
                  </h3>
                  <p className="text-[11px] text-yc-text-secondary mt-0.5">
                    {resume?.location || 'Verified Candidate'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-yc-border-subtle text-xs space-y-2">
                
                {resume?.uploadedAt && (
                  <div className="flex items-center justify-between text-yc-text-secondary">
                    <span>Uploaded Date:</span>
                    <span className="font-medium text-yc-text">
                      {new Date(resume.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-yc-text-secondary">
                  <span>Total Experience:</span>
                  <span className="font-medium text-yc-text">
                    {resume?.totalYearsExperience || 0} years
                  </span>
                </div>
                <div className="flex items-center justify-between text-yc-text-secondary">
                  <span>Indexed Skills:</span>
                  <span className="font-medium text-yc-text">
                    {(resume?.skills || []).length} 
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {resume?.pdfFileId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleOpenPreview}
                    isLoading={isLoadingPreview}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Cloud PDF
                  </Button>
                )}
              </div>
            </Card>

            {/* Contact & Professional Links */}
            <Card className="p-5 space-y-3">
              <CardHeader className="mb-0 pb-2">
                <CardTitle>Verified Contact Information</CardTitle>
              </CardHeader>
              <div className="space-y-2.5 text-xs">
                {resume?.email && (
                  <div className="flex items-center gap-2 text-yc-text">
                    <Mail className="w-3.5 h-3.5 text-yc-text-muted shrink-0" />
                    <span className="truncate">{resume.email}</span>
                  </div>
                )}
                {resume?.phone && (
                  <div className="flex items-center gap-2 text-yc-text">
                    <Phone className="w-3.5 h-3.5 text-yc-text-muted shrink-0" />
                    <span>{resume.phone}</span>
                  </div>
                )}
                {resume?.location && (
                  <div className="flex items-center gap-2 text-yc-text">
                    <MapPin className="w-3.5 h-3.5 text-yc-text-muted shrink-0" />
                    <span>{resume.location}</span>
                  </div>
                )}

                {/* Social Links */}
                <div className="pt-3 space-y-2 border-t border-yc-border-subtle">
                  {resume?.github && (
                    <a
                      href={resume.github.startsWith('http') ? resume.github : `https://${resume.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-yc-text hover:text-yc-orange transition-colors truncate"
                    >
                      <Github className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{resume.github}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-yc-text-muted shrink-0" />
                    </a>
                  )}
                  {resume?.linkedin && (
                    <a
                      href={resume.linkedin.startsWith('http') ? resume.linkedin : `https://${resume.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-yc-text hover:text-yc-orange transition-colors truncate"
                    >
                      <Linkedin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{resume.linkedin}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-yc-text-muted shrink-0" />
                    </a>
                  )}
                  {resume?.portfolio && (
                    <a
                      href={resume.portfolio.startsWith('http') ? resume.portfolio : `https://${resume.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-yc-text hover:text-yc-orange transition-colors truncate"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{resume.portfolio}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-yc-text-muted shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* Languages & Extras */}
            {resume?.languages && resume.languages.length > 0 && (
              <Card className="p-5 space-y-3">
                <CardHeader className="mb-0 pb-1">
                  <CardTitle className="flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-yc-text-muted" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <div className="space-y-1.5 text-xs">
                  {resume.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-medium text-yc-text">{lang.language}</span>
                      <span className="text-yc-text-secondary">{lang.proficiency || 'Proficient'}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column (Structured Extracted Content) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Professional Summary */}
            {resume?.summary && (
              <Card className="p-6 space-y-2">
                <CardHeader className="mb-0 pb-2">
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <p className="text-xs sm:text-sm text-yc-text leading-relaxed">
                  {resume.summary}
                </p>
                {resume.objective && (
                  <div className="pt-2 border-t border-yc-border-subtle">
                    <span className="text-[11px] font-semibold text-yc-text-secondary uppercase tracking-wider block mb-1">
                      Objective
                    </span>
                    <p className="text-xs text-yc-text-secondary leading-relaxed">
                      {resume.objective}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Categorized Technical Skills */}
            <Card className="p-6 space-y-4">
              <CardHeader className="mb-0 pb-2">
                <div className="flex items-center justify-between w-full">
                  <CardTitle>
                    Technical Skills ({(resume?.skills || []).length} Indexed)
                  </CardTitle>
                  
                </div>
              </CardHeader>

              {hasCategorizedSkills ? (
                <div className="space-y-3.5">
                  {Object.entries(skillsByCategory).map(([category, skills]) => {
                    if (!skills || skills.length === 0) return null;
                    return (
                      <div key={category} className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-yc-text uppercase tracking-wider">
                          {category}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-0.5 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border hover:border-yc-orange/50 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(resume?.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border hover:border-yc-orange/50 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Work Experience */}
            {resume?.experience && resume.experience.length > 0 && (
              <Card className="p-6 space-y-4">
                <CardHeader className="mb-0 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-yc-text-muted" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <div className="space-y-5 divide-y divide-yc-border-subtle">
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-5 space-y-2' : 'space-y-2'}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-semibold text-yc-text">{exp.title}</h4>
                          <p className="text-xs text-yc-text-secondary mt-0.5">
                            <span className="font-medium text-yc-text">{exp.company}</span>{' '}
                            {exp.location ? `• ${exp.location}` : ''}
                          </p>
                        </div>
                        <span className="text-[11px] text-yc-text-muted font-medium bg-yc-bg-secondary px-2 py-0.5 rounded-[4px] border border-yc-border shrink-0 self-start sm:self-auto">
                          {exp.startDate} – {exp.endDate || (exp.isCurrent ? 'Present' : 'Present')}
                        </span>
                      </div>

                      {exp.bullets && exp.bullets.length > 0 ? (
                        <ul className="list-disc list-outside space-y-1.5 text-xs text-yc-text-secondary pl-4 leading-relaxed">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      ) : exp.description ? (
                        <p className="text-xs text-yc-text-secondary leading-relaxed">
                          {exp.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Education */}
            {resume?.education && resume.education.length > 0 && (
              <Card className="p-6 space-y-4">
                <CardHeader className="mb-0 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-yc-text-muted" />
                    Education
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4 divide-y divide-yc-border-subtle">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-3 flex items-start justify-between text-xs' : 'flex items-start justify-between text-xs'}>
                      <div>
                        <h4 className="font-semibold text-yc-text text-sm">{edu.degree || 'Degree'}</h4>
                        <p className="text-yc-text-secondary mt-0.5">
                          {edu.institution} {edu.location ? `• ${edu.location}` : ''}
                        </p>
                        {edu.grade && (
                          <span className="text-[11px] text-yc-text-muted mt-0.5 block">
                            Grade / Honors: {edu.grade}
                          </span>
                        )}
                      </div>
                      <span className="text-yc-text-muted font-medium shrink-0">
                        {edu.startYear && edu.endYear
                          ? `${edu.startYear} – ${edu.endYear}`
                          : edu.year || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Projects */}
            {resume?.projects && resume.projects.length > 0 && (
              <Card className="p-6 space-y-4">
                <CardHeader className="mb-0 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yc-text-muted" />
                    Key Projects
                  </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[4px] border border-yc-border bg-yc-bg-subtle space-y-2 hover:border-yc-border-subtle transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-yc-text">{proj.name}</h4>
                        <div className="flex items-center gap-2 text-yc-text-muted">
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-yc-text transition-colors"
                              title="Source Repository"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-yc-text transition-colors"
                              title="Live Deployment"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-yc-text-secondary leading-relaxed">
                        {proj.description}
                      </p>
                      {proj.techUsed && proj.techUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.techUsed.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-white border border-yc-border text-yc-text-secondary"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Certifications & Awards */}
            {((resume?.certifications && resume.certifications.length > 0) ||
              (resume?.awards && resume.awards.length > 0)) && (
              <Card className="p-6 space-y-4">
                <CardHeader className="mb-0 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yc-text-muted" />
                    Certifications & Honors
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3 divide-y divide-yc-border-subtle">
                  {resume.certifications?.map((cert, idx) => (
                    <div key={`cert-${idx}`} className={idx > 0 ? 'pt-3 text-xs' : 'text-xs'}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-yc-text">{cert.name}</span>
                        {cert.date && <span className="text-yc-text-muted text-[11px]">{cert.date}</span>}
                      </div>
                      <p className="text-yc-text-secondary text-[11px] mt-0.5">{cert.issuer}</p>
                    </div>
                  ))}
                  {resume.awards?.map((award, idx) => (
                    <div key={`award-${idx}`} className="pt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-yc-text">{award.title}</span>
                        {award.date && <span className="text-yc-text-muted text-[11px]">{award.date}</span>}
                      </div>
                      <p className="text-yc-text-secondary text-[11px] mt-0.5">{award.issuer}</p>
                      {award.description && (
                        <p className="text-yc-text-muted text-[11px] mt-1">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Cloud PDF Preview Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          title="Resume PDF Preview"
          description="Live preview of your stored PDF resume served directly from MongoDB GridFS."
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-yc-text-secondary">Stored in cloud GridFS storage</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  isLoading={isDownloading}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>
                <Button variant="primary" size="sm" onClick={handleClosePreview}>
                  Done
                </Button>
              </div>
            </div>
          }
        >
          {previewBlobUrl ? (
            <iframe
              src={previewBlobUrl}
              title="Resume Preview"
              className="w-full h-[650px] border border-yc-border rounded-[4px]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-xs text-yc-text-muted">
              Loading preview stream...
            </div>
          )}
        </Modal>
      )}

      {/* Upload / Re-Upload Modal */}
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
        description="Replace or update your current resume. Gemini AI will re-parse all structured fields and regenerate vector embeddings."
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
              Parse & Update Cloud Resume
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[4px] p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-yc-orange bg-orange-50/50'
                : 'border-yc-border bg-yc-bg-secondary/40 hover:border-yc-orange/60'
            }`}
          >
            <FileText className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-yc-orange' : 'text-yc-text-muted'}`} />
            <p className="text-xs font-semibold text-yc-text">
              {selectedFile ? selectedFile.name : 'Drag & drop your resume PDF here, or click to browse'}
            </p>
            <p className="text-[11px] text-yc-text-secondary mt-1">
              Supports standard PDF documents up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            {selectedFile && (
              <div className="mt-2 text-xs font-medium text-yc-orange">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="text-[11px] text-yc-text-muted bg-yc-bg-secondary p-3 rounded-[4px] border border-yc-border">
            <span className="font-semibold text-yc-text">Backend Pipeline:</span> Once uploaded, the backend extracts the raw text and links, runs the Gemini structured extraction prompt, computes 768-dim vector embeddings, and stores the binary PDF in GridFS.
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
    </div>
  );
};
