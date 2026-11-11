import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobs';
import type { JobMatchItem } from '../api/types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Skeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  ExternalLink,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  Bookmark,
  Briefcase,
  Upload,
  ArrowUpDown,
  PlusCircle,
  Filter,
} from 'lucide-react';

export const JobDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<JobMatchItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMatchItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'company'>('score');

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [trackedJobIds, setTrackedJobIds] = useState<string[]>(() => {
    const tracked = localStorage.getItem('tracked_applications');
    if (tracked) {
      try {
        return JSON.parse(tracked).map((a: any) => a.id);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await jobsApi.getMatches();
        const list = res.matches || [];
        setMatches(list);
        if (list.length > 0) {
          setSelectedJob(list[0]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

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

  const handleTrackApplication = (job: JobMatchItem) => {
    try {
      const existing = localStorage.getItem('tracked_applications');
      const apps = existing ? JSON.parse(existing) : [];
      if (!apps.some((a: any) => a.role === job.title && a.company === job.company)) {
        const newApp = {
          id: `app-${Date.now()}`,
          role: job.title,
          company: job.company || 'Tech Company',
          appliedDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          source: job.source || 'Greenhouse',
          status: 'Applied',
          notes: `Matched with ${Math.round(job.score * 100)}% compatibility`,
          applyUrl: job.applyUrl,
        };
        const updated = [newApp, ...apps];
        localStorage.setItem('tracked_applications', JSON.stringify(updated));
        setTrackedJobIds((prev) => [...prev, job.jobId]);
      }
    } catch (e) {
      console.error('Error tracking application:', e);
    }
  };

  // Distinct company list from real backend matches
  const availableCompanies = useMemo(() => {
    const comps = new Set<string>();
    matches.forEach((m) => {
      if (m.company) comps.add(m.company);
    });
    return Array.from(comps);
  }, [matches]);

  const filteredJobs = useMemo(() => {
    return matches
      .filter((job) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          !query ||
          job.title.toLowerCase().includes(query) ||
          (job.company && job.company.toLowerCase().includes(query)) ||
          (job.location && job.location.toLowerCase().includes(query));

        const matchesCompany = companyFilter === 'all' || job.company === companyFilter;

        const matchesLocation =
          locationFilter === 'all' ||
          (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));

        const matchesRemote =
          !remoteOnly || (job.location && job.location.toLowerCase().includes('remote'));

        const matchesScore = job.score >= minScoreFilter;

        return matchesQuery && matchesCompany && matchesLocation && matchesRemote && matchesScore;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
        return 0;
      });
  }, [matches, searchQuery, companyFilter, locationFilter, remoteOnly, minScoreFilter, sortBy]);

  // Keep selected job in sync if filtered
  useEffect(() => {
    if (filteredJobs.length > 0 && (!selectedJob || !filteredJobs.some((j) => j.jobId === selectedJob.jobId))) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  const userSkills = user?.resume?.skills || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* ── 1. Search & Filter Bar ─────────────────────────────────── */}
      <div className="bg-white p-4 border border-yc-border rounded-[4px] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-lg">
            <Input
              placeholder="Search by title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Company Filter */}
            {availableCompanies.length > 0 && (
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text focus:outline-none focus:border-yc-orange"
              >
                <option value="all">All Companies</option>
                {availableCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text focus:outline-none focus:border-yc-orange"
            >
              <option value="all">All Locations</option>
              <option value="san francisco">San Francisco</option>
              <option value="remote">Remote</option>
              <option value="new york">New York</option>
            </select>

            {/* Minimum Score Filter */}
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text focus:outline-none focus:border-yc-orange"
            >
              <option value="0">All Match Scores</option>
              <option value="0.7">70%+ Match</option>
              <option value="0.8">80%+ Match</option>
              <option value="0.9">90%+ Match</option>
            </select>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 pl-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-yc-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-2.5 bg-white border border-yc-border rounded-[4px] text-yc-text focus:outline-none focus:border-yc-orange"
              >
                <option value="score">Sort: Best Match</option>
                <option value="title">Sort: Role Title</option>
                <option value="company">Sort: Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* Remote Quick Filter & Results Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-yc-border-subtle text-xs text-yc-text-secondary">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-yc-orange focus:ring-yc-orange border-yc-border cursor-pointer accent-[#F26522]"
            />
            <span>Remote positions only</span>
          </label>

          <span className="font-medium text-yc-text">
            Showing {filteredJobs.length} of {matches.length} matched engineering roles
          </span>
        </div>
      </div>

      {/* ── 2. Master-Detail Split Screen (5:7 Desktop Layout) ─────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-3">
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </div>
          <div className="md:col-span-7">
            <Skeleton height="500px" />
          </div>
        </div>
      ) : !user?.resume ? (
        <EmptyState
          icon={<Briefcase className="w-10 h-10" />}
          title="Resume Required for Vector Job Discovery"
          description="The job discovery engine scores live positions against your parsed skills and career vector. Upload your PDF resume to unlock personalized matching."
          action={
            <Link to="/profile">
              <Button size="md" variant="primary" icon={<Upload className="w-4 h-4" />}>
                Upload Resume PDF
              </Button>
            </Link>
          }
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="No Matching Openings"
          description="No engineering positions matched your search filters. Try adjusting your query or lowering the minimum match score."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCompanyFilter('all');
                setLocationFilter('all');
                setRemoteOnly(false);
                setMinScoreFilter(0);
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Listing Stream (~42% desktop) */}
          <div className="md:col-span-5 space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.jobId === job.jobId;
              const isSaved = savedJobIds.includes(job.jobId);
              const scorePercent = Math.round(job.score * 100);

              return (
                <div
                  key={job.jobId}
                  onClick={() => {
                    setSelectedJob(job);
                    if (window.innerWidth < 768) {
                      setTimeout(() => {
                        const el = document.getElementById('job-details-pane');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }
                  }}
                  className={`p-4 rounded-[4px] border transition-colors cursor-pointer text-left bg-white ${
                    isSelected
                      ? 'border-yc-orange ring-1 ring-yc-orange/30'
                      : 'border-yc-border hover:border-[#C4C4C4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-yc-text hover:text-black">
                        {job.title}
                      </h4>
                      <p className="text-xs text-yc-text-secondary flex items-center gap-1.5">
                        <span className="font-medium text-yc-text">{job.company || 'Tech Startup'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="success">
                        <Sparkles className="w-3 h-3 mr-0.5" />
                        {scorePercent}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-yc-border-subtle text-[11px] text-yc-text-muted">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {job.location || 'Location Not Specified'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-yc-text-secondary">Full-time</span>
                      {isSaved && <span className="text-yc-orange font-medium">• Saved</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Job Details Preview Pane (~58% desktop) */}
          {selectedJob && (
            <div id="job-details-pane" className="md:col-span-7 bg-white border border-yc-border rounded-[4px] p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-yc-border-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[4px] bg-yc-bg-secondary border border-yc-border flex items-center justify-center font-bold text-xs text-yc-text">
                      {selectedJob.company ? selectedJob.company.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <span className="text-xs font-semibold text-yc-text">
                      {selectedJob.company || 'Tech Company'}
                    </span>
                    <Badge variant="outline">Verified ATS Feed</Badge>
                  </div>

                  <h2 className="text-xl font-bold text-yc-text pt-1">{selectedJob.title}</h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-yc-text-secondary pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-yc-text-muted" />
                      {selectedJob.location || 'San Francisco, CA (Hybrid)'}
                    </span>
                    <span>•</span>
                    <span>Full-time Engineering Role</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSaveJob(selectedJob.jobId)}
                    icon={
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          savedJobIds.includes(selectedJob.jobId)
                            ? 'fill-yc-orange text-yc-orange'
                            : ''
                        }`}
                      />
                    }
                  >
                    {savedJobIds.includes(selectedJob.jobId) ? 'Saved' : 'Save'}
                  </Button>

                  {selectedJob.applyUrl && (
                    <a
                      href={selectedJob.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button size="sm" variant="primary">
                        Apply on ATS <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* AI Match Breakdown Card */}
              <div className="bg-yc-bg-secondary p-4 rounded-[4px] border border-yc-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yc-orange" />
                    <span className="text-xs font-semibold text-yc-text">
                      AI Compatibility Assessment
                    </span>
                  </div>
                  <Badge variant="success" size="md">
                    {Math.round(selectedJob.score * 100)}% Overall Score
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-white p-3 rounded-[4px] border border-yc-border">
                    <span className="text-yc-text-secondary block text-[11px]">
                      Semantic Vector Similarity
                    </span>
                    <span className="font-semibold text-yc-text text-sm">
                      {Math.round(selectedJob.embedScore * 100)}%
                    </span>
                    <span className="text-[10px] text-yc-text-muted block mt-0.5">
                      gemini-embedding-001 cosine
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-[4px] border border-yc-border">
                    <span className="text-yc-text-secondary block text-[11px]">
                      Verified Keyword Skills
                    </span>
                    <span className="font-semibold text-yc-text text-sm">
                      {Math.round(selectedJob.keywordScore * 100)}%
                    </span>
                    <span className="text-[10px] text-yc-text-muted block mt-0.5">
                      Resume skill overlap
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Resume Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-yc-text uppercase tracking-wider">
                  Indexed Candidate Skills ({userSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {userSkills.length > 0 ? (
                    userSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border"
                      >
                        <CheckCircle2 className="w-3 h-3 text-yc-success" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-yc-text-muted">No skills indexed in profile</span>
                  )}
                </div>
              </div>

              {/* Role Description & ATS Info */}
              <div className="space-y-3 text-xs leading-relaxed text-yc-text">
                <h4 className="text-xs font-semibold text-yc-text uppercase tracking-wider">
                  Position Details & Source
                </h4>
                <p className="text-yc-text-secondary">
                  This role was indexed from an official ATS career board and scored via the AUTO-JOB-APPLY background vector pipeline. Applying redirects you directly to the verified hiring company submission form.
                </p>

                <div className="p-3 bg-yc-bg-secondary rounded-[4px] border border-yc-border space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-yc-text-secondary">Application Destination:</span>
                    <span className="font-mono text-yc-text truncate max-w-xs">
                      {selectedJob.applyUrl ? new URL(selectedJob.applyUrl).hostname : 'Direct ATS'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-yc-text-secondary">ATS Feed Provider:</span>
                    <span className="font-medium text-yc-text">
                      {selectedJob.source ? selectedJob.source.toUpperCase() : 'GREENHOUSE / LEVER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="pt-4 border-t border-yc-border-subtle flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleTrackApplication(selectedJob)}
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Track in Applications
                </Button>

                {selectedJob.applyUrl && (
                  <a
                    href={selectedJob.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="primary" size="md">
                      Apply on ATS Board <ExternalLink className="w-4 h-4 ml-1.5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
