import React, { useState } from 'react';
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
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const resume = user?.resume;
  const hasResume = !!resume;

  const handleDownloadPdf = async () => {
    if (!resume?.pdfFileId) return;
    setIsDownloading(true);
    try {
      const blob = await resumeApi.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('Please choose a valid PDF file.');
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
      }, 1200);
    } catch (err: any) {
      setUploadError(
        err.response?.data?.error || err.response?.data?.message || 'Upload failed.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const skillsByCategory = resume?.skillsByCategory || {};
  const hasCategorizedSkills = Object.keys(skillsByCategory).length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">
            Profile & Resume Intelligence
          </h1>
          <p className="text-xs text-yc-text-secondary mt-1">
            Parsed by Google Gemini AI, stored securely in MongoDB GridFS, and vectorized for semantic ATS matching.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasResume && resume?.pdfFileId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              isLoading={isDownloading}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            {hasResume ? 'Re-upload PDF' : 'Upload Resume PDF'}
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
          {/* Left Column (Metadata & Contact Links) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Active Resume PDF Card */}
            <Card className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-[4px] bg-yc-bg-secondary border border-yc-border text-yc-text">
                  <FileText className="w-6 h-6 text-yc-orange" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-yc-text truncate">
                    {resume?.fullName ? `${resume.fullName} Resume.pdf` : 'Candidate Resume.pdf'}
                  </h3>
                  <p className="text-[11px] text-yc-text-secondary">
                    Stored in MongoDB GridFS
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-yc-border-subtle text-xs space-y-2">
                <div className="flex items-center justify-between text-yc-text-secondary">
                  <span>Vector Embedding:</span>
                  <Badge variant="success">Active (768-dim)</Badge>
                </div>
                {resume?.uploadedAt && (
                  <div className="flex items-center justify-between text-yc-text-secondary">
                    <span>Uploaded:</span>
                    <span className="font-medium text-yc-text">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-yc-text-secondary">
                  <span>Experience:</span>
                  <span className="font-medium text-yc-text">
                    {resume?.totalYearsExperience || 0} years
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {resume?.pdfFileId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleDownloadPdf}
                    isLoading={isDownloading}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            </Card>

            {/* Contact & Social Links */}
            <Card className="p-5 space-y-3">
              <CardHeader className="mb-0 pb-2">
                <CardTitle>Verified Contact Information</CardTitle>
              </CardHeader>
              <div className="space-y-2.5 text-xs">
                {resume?.fullName && (
                  <div>
                    <span className="text-yc-text-secondary block text-[11px]">Name:</span>
                    <span className="font-medium text-yc-text">{resume.fullName}</span>
                  </div>
                )}
                {resume?.email && (
                  <div>
                    <span className="text-yc-text-secondary block text-[11px]">Email:</span>
                    <span className="font-medium text-yc-text">{resume.email}</span>
                  </div>
                )}
                {resume?.phone && (
                  <div>
                    <span className="text-yc-text-secondary block text-[11px]">Phone:</span>
                    <span className="font-medium text-yc-text">{resume.phone}</span>
                  </div>
                )}
                {resume?.location && (
                  <div>
                    <span className="text-yc-text-secondary block text-[11px]">Location:</span>
                    <span className="font-medium text-yc-text">{resume.location}</span>
                  </div>
                )}

                {/* Social Links */}
                <div className="pt-2 space-y-1.5 border-t border-yc-border-subtle">
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
          </div>

          {/* Right Column (Structured Extracted Content) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Professional Summary */}
            {resume?.summary && (
              <Card className="p-6 space-y-2">
                <CardHeader className="mb-0 pb-2">
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <p className="text-xs sm:text-sm text-yc-text-secondary leading-relaxed">
                  {resume.summary}
                </p>
              </Card>
            )}

            {/* Categorized Technical Skills */}
            <Card className="p-6 space-y-4">
              <CardHeader className="mb-0 pb-2">
                <div className="flex items-center justify-between w-full">
                  <CardTitle>Technical Skills ({(resume?.skills || []).length} Indexed)</CardTitle>
                  <Badge variant="orange">Gemini Normalized</Badge>
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
                              className="text-xs px-2 py-0.5 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border"
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
                      className="text-xs px-2 py-0.5 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border"
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
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <div className="space-y-5 divide-y divide-yc-border-subtle">
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-4 space-y-2' : 'space-y-2'}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-semibold text-yc-text">{exp.title}</h4>
                          <p className="text-xs text-yc-text-secondary">
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </p>
                        </div>
                        <span className="text-[11px] text-yc-text-muted font-medium">
                          {exp.startDate} – {exp.endDate || (exp.isCurrent ? 'Present' : '')}
                        </span>
                      </div>

                      {exp.bullets && exp.bullets.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-xs text-yc-text-secondary pl-1 leading-relaxed">
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
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="flex items-start justify-between text-xs">
                      <div>
                        <h4 className="font-semibold text-yc-text">{edu.degree || 'Degree'}</h4>
                        <p className="text-yc-text-secondary">
                          {edu.institution} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                        </p>
                      </div>
                      <span className="text-yc-text-muted font-medium">
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
                  <CardTitle>Key Projects</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[4px] border border-yc-border bg-yc-bg-subtle space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-yc-text">{proj.name}</h4>
                        <div className="flex items-center gap-1.5 text-yc-text-muted">
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-yc-text"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-yc-text"
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
          </div>
        </div>
      )}

      {/* Upload Modal */}
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
          <div className="border-2 border-dashed border-yc-border rounded-[4px] p-6 text-center hover:border-yc-orange/60 transition-colors bg-yc-bg-secondary/40">
            <FileText className="w-8 h-8 text-yc-text-muted mx-auto mb-2" />
            <p className="text-xs font-medium text-yc-text">
              {selectedFile ? selectedFile.name : 'Choose a resume PDF file'}
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
    </div>
  );
};

