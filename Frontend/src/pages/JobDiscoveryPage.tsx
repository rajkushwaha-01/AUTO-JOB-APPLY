import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobs';
import type { JobItem } from '../api/types';
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
  ArrowUpDown,
  PlusCircle,
  Layers,
  ArrowRight,
  Globe,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'fullstack', label: 'Full-Stack' },
  { value: 'ai-ml', label: 'AI / Machine Learning' },
  { value: 'devops-sre', label: 'DevOps / Cloud / SRE' },
  { value: 'security', label: 'Security & Trust' },
  { value: 'management', label: 'Engineering Lead' },
];

const GENUINE_LOCATIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'remote', label: 'Remote / Anywhere' },
  { value: 'sf-bay', label: 'San Francisco / Bay Area' },
  { value: 'nyc', label: 'New York City' },
  { value: 'seattle', label: 'Seattle, WA' },
  { value: 'us', label: 'United States' },
  { value: 'india', label: 'India (Bengaluru / Gurugram)' },
  { value: 'london', label: 'London, UK' },
  { value: 'europe', label: 'Europe (Dublin / Berlin / Spain)' },
  { value: 'canada', label: 'Canada' },
  { value: 'apac', label: 'Asia-Pacific (Singapore / Japan / Australia)' },
];

export const JobDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'company'>('newest');

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

  const fetchAllJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobsApi.getAllJobs({ limit: 300 });
      const list = res.jobs || [];
      setJobs(list);
      if (list.length > 0) {
        setSelectedJob(list[0]);
      }
    } catch (err) {
      console.error('Error fetching all jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const toggleSaveJob = (id: string) => {
    setSavedJobIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('saved_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleTrackApplication = (job: JobItem) => {
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
          notes: `Tracked from job discovery`,
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

  // Distinct company list from real backend jobs
  const availableCompanies = useMemo(() => {
    const comps = new Set<string>();
    jobs.forEach((j) => {
      if (j.company) comps.add(j.company.toLowerCase());
    });
    return Array.from(comps);
  }, [jobs]);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesQuery =
          !searchQuery ||
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCompany =
          companyFilter === 'all' ||
          (job.company && job.company.toLowerCase() === companyFilter.toLowerCase());

        // Location matching with genuine location hubs
        const loc = (job.location || '').toLowerCase();
        let matchesLocation = true;
        if (locationFilter === 'remote') {
          matchesLocation = loc.includes('remote');
        } else if (locationFilter === 'sf-bay') {
          matchesLocation =
            loc.includes('san francisco') ||
            loc.includes('sf') ||
            loc.includes('california') ||
            loc.includes('ca');
        } else if (locationFilter === 'nyc') {
          matchesLocation = loc.includes('new york') || loc.includes('nyc');
        } else if (locationFilter === 'seattle') {
          matchesLocation = loc.includes('seattle') || loc.includes('sea');
        } else if (locationFilter === 'us') {
          matchesLocation =
            loc.includes('united states') ||
            loc.includes('usa') ||
            loc.includes('us') ||
            loc.includes('san francisco') ||
            loc.includes('new york') ||
            loc.includes('seattle') ||
            loc.includes('chicago') ||
            loc.includes('austin') ||
            loc.includes('raleigh') ||
            loc.includes('dallas') ||
            loc.includes('atl');
        } else if (locationFilter === 'india') {
          matchesLocation =
            loc.includes('india') ||
            loc.includes('bengaluru') ||
            loc.includes('bangalore') ||
            loc.includes('gurugram');
        } else if (locationFilter === 'london') {
          matchesLocation =
            loc.includes('london') || loc.includes('united kingdom') || loc.includes('uk');
        } else if (locationFilter === 'europe') {
          matchesLocation =
            loc.includes('dublin') ||
            loc.includes('ireland') ||
            loc.includes('berlin') ||
            loc.includes('germany') ||
            loc.includes('spain') ||
            loc.includes('barcelona') ||
            loc.includes('netherlands') ||
            loc.includes('france') ||
            loc.includes('poland');
        } else if (locationFilter === 'canada') {
          matchesLocation = loc.includes('canada');
        } else if (locationFilter === 'apac') {
          matchesLocation =
            loc.includes('singapore') ||
            loc.includes('japan') ||
            loc.includes('australia') ||
            loc.includes('korea') ||
            loc.includes('thailand') ||
            loc.includes('china');
        }

        const matchesRemote =
          !remoteOnly ||
          loc.includes('remote') ||
          job.title.toLowerCase().includes('remote');

        // Role Filter matching
        const title = job.title.toLowerCase();
        const desc = (job.description || '').toLowerCase();
        const text = `${title} ${desc}`;

        let matchesRole = true;
        if (roleFilter === 'backend') {
          matchesRole =
            title.includes('backend') ||
            title.includes('back-end') ||
            title.includes('back end') ||
            title.includes('python') ||
            title.includes('ruby') ||
            title.includes('golang') ||
            title.includes('systems') ||
            (desc.includes('backend') && (title.includes('engineer') || title.includes('developer')));
        } else if (roleFilter === 'frontend') {
          matchesRole =
            title.includes('frontend') ||
            title.includes('front-end') ||
            title.includes('front end') ||
            title.includes('react') ||
            title.includes('web') ||
            title.includes('ui') ||
            (desc.includes('frontend') && (title.includes('engineer') || title.includes('developer')));
        } else if (roleFilter === 'fullstack') {
          matchesRole =
            title.includes('full-stack') ||
            title.includes('fullstack') ||
            title.includes('full stack') ||
            (text.includes('frontend') && text.includes('backend')) ||
            text.includes('full stack') ||
            text.includes('fullstack');
        } else if (roleFilter === 'ai-ml') {
          matchesRole =
            title.includes('ai') ||
            title.includes('machine learning') ||
            title.includes('ml') ||
            title.includes('data') ||
            title.includes('research') ||
            text.includes('machine learning');
        } else if (roleFilter === 'devops-sre') {
          matchesRole =
            title.includes('devops') ||
            title.includes('reliability') ||
            title.includes('sre') ||
            title.includes('infrastructure') ||
            title.includes('platform') ||
            title.includes('cloud') ||
            text.includes('kubernetes') ||
            text.includes('infrastructure');
        } else if (roleFilter === 'security') {
          matchesRole =
            title.includes('security') ||
            title.includes('abuse') ||
            title.includes('fraud') ||
            title.includes('investigator') ||
            title.includes('red team');
        } else if (roleFilter === 'management') {
          matchesRole =
            title.includes('manager') ||
            title.includes('lead') ||
            title.includes('director') ||
            title.includes('principal') ||
            title.includes('head');
        }

        return matchesQuery && matchesCompany && matchesLocation && matchesRemote && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
        // default newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [jobs, searchQuery, roleFilter, companyFilter, locationFilter, remoteOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Matched Jobs Callout Banner */}
      <div className="p-4 rounded-[4px] bg-yc-bg-secondary border border-yc-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-white border border-yc-border flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-yc-orange" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-yc-text">
              Looking for personalized AI job matches?
            </h4>
            <p className="text-[11px] text-yc-text-secondary">
              See the 10 most compatible tech positions scored against your resume vector.
            </p>
          </div>
        </div>
        <Link to="/matched-jobs">
          <Button size="sm" variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
            View AI-Matched Jobs
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-yc-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-yc-text">Find Jobs</h1>
            <Badge variant="outline" size="sm">
              <Layers className="w-3 h-3 mr-1 text-yc-text-muted" />
              {jobs.length} Total Postings
            </Badge>
          </div>
          <p className="text-xs text-yc-text-secondary mt-1">
            Browse all open engineering and technical positions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-yc-text-secondary">
            Showing <strong className="text-yc-text">{filteredJobs.length}</strong> of {jobs.length} jobs
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-yc-border rounded-[4px] p-4 space-y-3">
        {/* Main Toolbar: Search Input + Company + Location + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input takes all remaining flex width */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by title, company, skills, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-yc-text-muted" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Company Dropdown */}
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="h-9 px-2.5 bg-white border border-yc-border rounded-[4px] text-yc-text max-w-[150px] truncate focus:outline-none focus:border-yc-orange"
            >
              <option value="all">All Companies</option>
              {availableCompanies.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Genuine Location Dropdown */}
            <div className="flex items-center">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-9 px-2.5 bg-white border border-yc-border rounded-[4px] text-yc-text max-w-[200px] truncate focus:outline-none focus:border-yc-orange"
              >
                {GENUINE_LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 pl-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-yc-text-muted shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-2 bg-white border border-yc-border rounded-[4px] text-yc-text focus:outline-none focus:border-yc-orange"
              >
                <option value="newest">Newest</option>
                <option value="title">Role Title</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* SINGLE Role Selector: 1-Click Interactive Pills + Remote Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-yc-border-subtle text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-yc-text-secondary uppercase tracking-wider mr-1 hidden sm:inline">
              Role:
            </span>
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors whitespace-nowrap ${
                  roleFilter === r.value
                    ? 'bg-yc-text text-white shadow-xs'
                    : 'bg-yc-bg-secondary text-yc-text-secondary hover:text-yc-text border border-yc-border hover:bg-yc-bg'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0 pt-1 sm:pt-0">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-yc-orange focus:ring-yc-orange border-yc-border cursor-pointer accent-[#F26522]"
            />
            <span className="text-yc-text-secondary">Remote only</span>
          </label>
        </div>
      </div>

      {/* Main Content View (Master-Detail) */}
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
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="No Matching Openings"
          description="No positions matched your search filters. Try adjusting your role, location, or reset your filters."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setCompanyFilter('all');
                setLocationFilter('all');
                setRemoteOnly(false);
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Listing Stream */}
          <div className="md:col-span-5 space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.jobId === job.jobId;
              const isSaved = savedJobIds.includes(job.jobId);

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
                        <span className="font-medium text-yc-text capitalize">
                          {job.company || 'Tech Startup'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" size="sm">
                        {job.source || 'ATS'}
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

          {/* Right Column: Job Details Preview Pane */}
          {selectedJob && (
            <div
              id="job-details-pane"
              className="md:col-span-7 bg-white border border-yc-border rounded-[4px] p-6 space-y-6"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-yc-border-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[4px] bg-yc-bg-secondary border border-yc-border flex items-center justify-center font-bold text-xs text-yc-text capitalize">
                      {selectedJob.company ? selectedJob.company.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <span className="text-xs font-semibold text-yc-text capitalize">
                      {selectedJob.company || 'Tech Company'}
                    </span>
                    <Badge variant="outline">Verified ATS Feed</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-yc-text pt-1">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-yc-text-secondary pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-yc-text-muted" />
                      {selectedJob.location || 'Location Not Specified'}
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

              {/* Job Metadata Pill */}
              <div className="bg-yc-bg-secondary p-3.5 rounded-[4px] border border-yc-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-yc-text-secondary">Source Platform:</span>{' '}
                  <span className="font-semibold text-yc-text uppercase">{selectedJob.source || 'Greenhouse'}</span>
                </div>
                <div>
                  <span className="text-yc-text-secondary">Employment Type:</span>{' '}
                  <span className="font-medium text-yc-text">Full-time</span>
                </div>
                <div>
                  <span className="text-yc-text-secondary">Location:</span>{' '}
                  <span className="font-medium text-yc-text">{selectedJob.location || 'Flexible'}</span>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-yc-text-secondary">
                  Job Description & Scope
                </h3>
                {selectedJob.description ? (
                  <div
                    className="text-xs leading-relaxed text-yc-text space-y-2 max-h-[420px] overflow-y-auto pr-2"
                    dangerouslySetInnerHTML={{
                      __html: selectedJob.description
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&amp;/g, '&'),
                    }}
                  />
                ) : (
                  <p className="text-xs text-yc-text-secondary leading-relaxed">
                    This position was indexed from an official ATS board. Click 'Apply on ATS' to view the complete job description and submit your application.
                  </p>
                )}
              </div>

              {/* Track Application Quick Action */}
              <div className="pt-4 border-t border-yc-border-subtle flex items-center justify-between">
                <span className="text-xs text-yc-text-secondary">
                  Applied to this position? Add it to your pipeline.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTrackApplication(selectedJob)}
                  disabled={trackedJobIds.includes(selectedJob.jobId)}
                  icon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  {trackedJobIds.includes(selectedJob.jobId) ? 'Added to Tracker' : 'Track Application'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
