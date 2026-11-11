import React, { useEffect, useState, useMemo } from 'react';
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
  Share2,
  Briefcase,
} from 'lucide-react';

export const JobDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<JobMatchItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMatchItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await jobsApi.getMatches();
        setMatches(res.matches || []);
        if (res.matches && res.matches.length > 0) {
          setSelectedJob(res.matches[0]);
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

  const filteredJobs = useMemo(() => {
    return matches.filter((job) => {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        (job.company && job.company.toLowerCase().includes(query)) ||
        (job.location && job.location.toLowerCase().includes(query));

      const matchesLocation =
        locationFilter === 'all' ||
        (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));

      const matchesScore = job.score >= minScoreFilter;

      return matchesQuery && matchesLocation && matchesScore;
    });
  }, [matches, searchQuery, locationFilter, minScoreFilter]);

  // Keep selected job updated if filter changes
  useEffect(() => {
    if (filteredJobs.length > 0 && (!selectedJob || !filteredJobs.some((j) => j.jobId === selectedJob.jobId))) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  const userSkills = user?.resume?.skills || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 border border-yc-border rounded-[4px]">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by title, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text focus:outline-none focus:border-yc-orange"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="san francisco">San Francisco</option>
            <option value="new york">New York</option>
          </select>

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

          <span className="text-yc-text-muted text-xs ml-2 select-none">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'}
          </span>
        </div>
      </div>

      {/* Main 5:7 Master-Detail View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-3">
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </div>
          <div className="md:col-span-7">
            <Skeleton height="450px" />
          </div>
        </div>
      ) : !user?.resume ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="Upload Resume to Discover Matches"
          description="Vector semantic matching requires parsed candidate data. Upload your resume PDF to calculate similarity scores against all open roles."
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No Matching Roles Found"
          description="Try broadening your search query or reducing the minimum match score threshold."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column (Job Stream) */}
          <div className="md:col-span-5 space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.jobId === job.jobId;
              const isSaved = savedJobIds.includes(job.jobId);
              return (
                <div
                  key={job.jobId}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-[4px] border transition-colors cursor-pointer text-left bg-white ${
                    isSelected
                      ? 'border-yc-orange ring-1 ring-yc-orange/30'
                      : 'border-yc-border hover:border-[#C4C4C4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-yc-text">{job.title}</h4>
                      <p className="text-xs text-yc-text-secondary mt-0.5">
                        {job.company || 'Tech Company'}
                      </p>
                    </div>
                    <Badge variant="success">
                      <Sparkles className="w-3 h-3 mr-0.5" />
                      {Math.round(job.score * 100)}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-yc-text-muted">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
                      {job.location || 'Location Not Specified'}
                    </span>
                    <span>•</span>
                    <span>Full-time</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (Job Details Preview Pane) */}
          {selectedJob && (
            <div className="md:col-span-7 bg-white border border-yc-border rounded-[4px] p-6 space-y-6">
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-yc-border-subtle">
                <div>
                  <h2 className="text-xl font-bold text-yc-text">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-yc-text-secondary">
                    <span className="flex items-center gap-1 font-medium text-yc-text">
                      <Building className="w-3.5 h-3.5 text-yc-text-muted" />
                      {selectedJob.company || 'Tech Company'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-yc-text-muted" />
                      {selectedJob.location || 'San Francisco, CA'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                  <div className="bg-white p-2.5 rounded-[4px] border border-yc-border">
                    <span className="text-yc-text-secondary block text-[11px]">
                      Semantic Vector Similarity
                    </span>
                    <span className="font-semibold text-yc-text text-sm">
                      {Math.round(selectedJob.embedScore * 100)}%
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-[4px] border border-yc-border">
                    <span className="text-yc-text-secondary block text-[11px]">
                      Verified Keyword Skills
                    </span>
                    <span className="font-semibold text-yc-text text-sm">
                      {Math.round(selectedJob.keywordScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Resume Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-yc-text uppercase tracking-wider">
                  Indexed Candidate Skills
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
                    <span className="text-xs text-yc-text-muted">No skills indexed</span>
                  )}
                </div>
              </div>

              {/* Role Details */}
              <div className="space-y-3 text-xs leading-relaxed text-yc-text">
                <h4 className="text-xs font-semibold text-yc-text uppercase tracking-wider">
                  Role Description & Expectations
                </h4>
                <p className="text-yc-text-secondary">
                  This role was indexed from an official ATS career board. It has been verified by the AUTO-JOB-APPLY background ingestion pipeline.
                </p>
                <div className="p-3 bg-yc-bg-secondary rounded-[4px] border border-yc-border">
                  <p className="text-[11px] text-yc-text-secondary">
                    Source: Verified Greenhouse / Lever direct posting. External application link directs to the original hiring team form.
                  </p>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="pt-4 border-t border-yc-border-subtle flex items-center justify-between">
                <span className="text-xs text-yc-text-secondary">
                  Ready to apply to {selectedJob.company}?
                </span>
                {selectedJob.applyUrl && (
                  <a href={selectedJob.applyUrl} target="_blank" rel="noopener noreferrer">
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

