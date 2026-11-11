import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobs';
import { resumeApi } from '../api/resume';
import type { JobMatchItem } from '../api/types';
import { Card, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  Sparkles,
  ExternalLink,
  Upload,
  FileText,
  Briefcase,
  ArrowRight,
  Bookmark,
  Download,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<JobMatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [trackedCount, setTrackedCount] = useState<number>(0);
  const [interviewCount, setInterviewCount] = useState<number>(0);

  useEffect(() => {
    // Read local tracked applications count
    try {
      const apps = localStorage.getItem('tracked_applications');
      if (apps) {
        const parsed = JSON.parse(apps);
        setTrackedCount(parsed.length);
        setInterviewCount(
          parsed.filter((a: any) =>
            a.status === 'Interview' ||
            a.status === 'Interviewing' ||
            a.status === 'Offer' ||
            a.status === 'Accepted'
          ).length
        );
      }
    } catch {
      // Fallback
    }
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await jobsApi.getMatches();
      setMatches(res.matches || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Unable to calculate vector matches. Please ensure a valid resume is uploaded.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.resume) {
      fetchMatches();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const toggleSaveJob = (id: string) => {
    setSavedJobIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('saved_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDownloadPdf = async () => {
    if (!user?.resume?.pdfFileId) return;
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

  const hasResume = !!user?.resume;
  const skillsCount = user?.resume?.skills?.length || 0;
  const topMatchScore =
    matches.length > 0 ? Math.round(Math.max(...matches.map((m) => m.score)) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── 1. Welcome & Greeting Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">
            Welcome back, {user?.name}
          </h1>
          
        </div>

        <div className="flex items-center gap-2">
          {hasResume && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMatches}
              isLoading={isLoading}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Matches
            </Button>
          )}
          <Link to="/jobs">
            <Button variant="outline" size="sm" icon={<Briefcase className="w-3.5 h-3.5" />}>
              Explore All Jobs
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="primary" size="sm" icon={<Upload className="w-3.5 h-3.5" />}>
              {hasResume ? 'Manage Resume' : '+ Upload Resume'}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Metric Overview Strip (Supported by Backend Data) ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: AI Job Matches */}
        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary font-medium">AI Job Matches</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">{matches.length}</span>
            {matches.length > 0 && <Badge variant="success">Active</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">Cosine similarity &gt; 0.35 cutoff</p>
        </Card>

        {/* Metric 2: Top Compatibility */}
        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary font-medium">Top Match Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-orange">
              {topMatchScore > 0 ? `${topMatchScore}%` : '—'}
            </span>
            {topMatchScore > 0 && <Badge variant="orange">High Fit</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">Hybrid vector + keyword boost</p>
        </Card>

        {/* Metric 3: Candidate Pipeline */}
        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary font-medium">Tracked Applications</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">{trackedCount}</span>
            {interviewCount > 0 && (
              <Badge variant="warning">{interviewCount} Interviewing</Badge>
            )}
          </div>
          <p className="text-[11px] text-yc-text-muted">Direct ATS pipeline tracker</p>
        </Card>

        {/* Metric 4: Resume Health */}
        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary font-medium">Resume & Skills</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">
              {hasResume ? `${skillsCount} skills` : 'No file'}
            </span>
            {hasResume && <Badge variant="success">GridFS</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">
            {hasResume ? 'Gemini structured schema' : 'Upload to vectorize'}
          </p>
        </Card>
      </div>

      {/* ── 3. Main Two-Column Layout (7:5 Split) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Recommended Jobs Feed) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-yc-text">Recommended Opportunities</h2>
              <Badge variant="outline">{matches.length} Matched</Badge>
            </div>
            {matches.length > 0 && (
              <Link
                to="/jobs"
                className="text-xs text-yc-orange hover:underline font-medium inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center justify-between p-3.5 bg-yc-error-bg border border-yc-error-border rounded-[4px] text-xs text-yc-error">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchMatches}>
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton height="110px" />
              <Skeleton height="110px" />
              <Skeleton height="110px" />
            </div>
          ) : !hasResume ? (
            <EmptyState
              icon={<FileText className="w-10 h-10" />}
              title="No Resume Uploaded Yet"
              description="To discover real jobs matching your background and compute cosine vector scores, upload your resume PDF."
              action={
                <Link to="/profile">
                  <Button size="md" variant="primary" icon={<Upload className="w-4 h-4" />}>
                    Upload Resume PDF
                  </Button>
                </Link>
              }
            />
          ) : matches.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-10 h-10" />}
              title="No Open Matches Found"
              description="We evaluated your resume vector against all active ATS job listings. Expand your role preferences or check back once new jobs are ingested."
              action={
                <Link to="/automation">
                  <Button size="sm" variant="outline">
                    Edit Matching Preferences
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map((item) => {
                const isSaved = savedJobIds.includes(item.jobId);
                const scorePercent = Math.round(item.score * 100);

                return (
                  <Card key={item.jobId} hoverable className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-yc-text hover:text-black transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-yc-text-secondary flex items-center gap-2">
                          <span className="font-medium text-yc-text">{item.company || 'Tech Startup'}</span>
                          <span>•</span>
                          <span>{item.location || 'San Francisco, CA'}</span>
                          <span>•</span>
                          <span className="text-[11px] text-yc-text-muted">Direct ATS</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="success">
                          <Sparkles className="w-3 h-3 mr-0.5" />
                          {scorePercent}% Match
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-yc-border-subtle text-[11px] text-yc-text-secondary">
                      <div className="flex items-center gap-3">
                        <span>Semantic Vector: {Math.round(item.embedScore * 100)}%</span>
                        <span>•</span>
                        <span>Keywords: {Math.round(item.keywordScore * 100)}%</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(item.jobId)}
                          icon={
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isSaved ? 'fill-yc-orange text-yc-orange' : 'text-yc-text-muted'
                              }`}
                            />
                          }
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>

                        {item.applyUrl && (
                          <a
                            href={item.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                          >
                            <Button size="sm" variant="primary">
                              Apply Now <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (Sidebar Panels) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel 1: Resume Health & Quick Actions */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Resume Intelligence</CardTitle>
              {hasResume ? (
                <Badge variant="success">Active & Vectorized</Badge>
              ) : (
                <Badge variant="warning">Missing</Badge>
              )}
            </CardHeader>

            {hasResume ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-yc-bg-secondary rounded-[4px] border border-yc-border">
                  <FileText className="w-5 h-5 text-yc-orange shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="font-semibold text-yc-text truncate">
                      {user?.resume?.fullName ? `${user.resume.fullName} Resume.pdf` : 'Candidate Resume.pdf'}
                    </p>
                    <p className="text-[11px] text-yc-text-secondary mt-0.5">
                      Stored in MongoDB GridFS • 768-dim Vector Cached
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-yc-text-secondary pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                    <span>Candidate Name:</span>
                    <span className="font-medium text-yc-text">
                      {user?.resume?.fullName || user?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                    <span>Parsed Email:</span>
                    <span className="font-medium text-yc-text truncate max-w-[180px]">
                      {user?.resume?.email || user?.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                    <span>Total Experience:</span>
                    <span className="font-medium text-yc-text">
                      {user?.resume?.totalYearsExperience || 0} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                    <span>Indexed Skills:</span>
                    <span className="font-medium text-yc-text">
                      {skillsCount} skills categorized
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {user?.resume?.pdfFileId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleDownloadPdf}
                      isLoading={isDownloading}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download PDF
                    </Button>
                  )}
                  <Link to="/profile" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-yc-text-secondary leading-relaxed">
                  Upload your resume PDF to extract skills, project links, and experience into structured data.
                </p>
                <Link to="/profile">
                  <Button variant="primary" size="sm" className="w-full" icon={<Upload className="w-3.5 h-3.5" />}>
                    Upload Resume PDF
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Panel 2: Recent Activity Timeline */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-yc-success mt-1 shrink-0" />
                <div>
                  <p className="text-yc-text font-medium">Matching engine evaluated active postings</p>
                  <p className="text-[11px] text-yc-text-muted">Greenhouse and Lever boards synced</p>
                </div>
              </div>

              {hasResume && (
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-yc-orange mt-1 shrink-0" />
                  <div>
                    <p className="text-yc-text font-medium">Semantic vector embedding cached</p>
                    <p className="text-[11px] text-yc-text-muted">
                      Hash: {user?.resume?.embeddingHash?.slice(0, 12) || 'e3b0c442...'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-neutral-400 mt-1 shrink-0" />
                <div>
                  <p className="text-yc-text font-medium">Candidate workspace active</p>
                  <p className="text-[11px] text-yc-text-muted">Account session authenticated</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Panel 3: Search Preferences Summary */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Search & Match Preferences</CardTitle>
              <Link to="/automation" className="text-xs text-yc-orange hover:underline font-medium">
                Configure
              </Link>
            </CardHeader>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-yc-text-secondary block mb-1">Target Roles:</span>
                <div className="flex flex-wrap gap-1">
                  {user?.preferences?.roles?.length ? (
                    user.preferences.roles.map((r, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border"
                      >
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-yc-text-muted">
                      Full Stack, Frontend, Backend Software Engineer
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-yc-border-subtle flex items-center justify-between text-yc-text-secondary">
                <span>Locations:</span>
                <span className="font-medium text-yc-text">
                  {user?.preferences?.locations?.length
                    ? user.preferences.locations.join(', ')
                    : 'San Francisco, Remote'}
                </span>
              </div>

              <div className="flex items-center justify-between text-yc-text-secondary">
                <span>Remote Only:</span>
                <span className="font-medium text-yc-text">
                  {user?.preferences?.remoteOnly ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
