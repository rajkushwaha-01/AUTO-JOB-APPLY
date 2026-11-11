import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobs';
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
  Layers,
  ArrowRight,
  Bookmark,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<JobMatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await jobsApi.getMatches();
        setMatches(res.matches || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to compute matches.');
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

  const hasResume = !!user?.resume;
  const skillsCount = user?.resume?.skills?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-yc-text-secondary mt-1">
            {hasResume
              ? `AI Matching Engine active with 768-dim vector embeddings · ${matches.length} matching roles discovered.`
              : 'Upload your resume PDF to activate AI vector semantic job matching.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/jobs">
            <Button variant="outline" size="sm" icon={<Briefcase className="w-3.5 h-3.5" />}>
              Find Jobs
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="primary" size="sm" icon={<Upload className="w-3.5 h-3.5" />}>
              Manage Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary">AI Job Matches</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">{matches.length}</span>
            {matches.length > 0 && <Badge variant="success">Active</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">Ranked by cosine similarity</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary">Vector Embedding</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">
              {hasResume ? '768-dim' : 'None'}
            </span>
            {hasResume && <Badge variant="success">Synced</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">gemini-embedding-001</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary">Indexed Skills</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">{skillsCount}</span>
            {skillsCount > 0 && <Badge variant="orange">Verified</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">Parsed from PDF resume</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs text-yc-text-secondary">Resume Storage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yc-text">
              {hasResume ? 'GridFS' : 'Empty'}
            </span>
            {hasResume && <Badge variant="default">MongoDB</Badge>}
          </div>
          <p className="text-[11px] text-yc-text-muted">Encrypted binary stream</p>
        </Card>
      </div>

      {/* Main Two-Column Layout (7:5 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Recommended Jobs) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-yc-text">Recommended Opportunities</h2>
              <Badge variant="outline">{matches.length}</Badge>
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

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton height="110px" />
              <Skeleton height="110px" />
              <Skeleton height="110px" />
            </div>
          ) : !hasResume ? (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="No Resume Uploaded Yet"
              description="To discover real jobs matching your background and compute cosine similarity scores, upload your resume PDF."
              action={
                <Link to="/profile">
                  <Button size="sm" variant="primary" icon={<Upload className="w-3.5 h-3.5" />}>
                    Upload Resume PDF
                  </Button>
                </Link>
              }
            />
          ) : matches.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-8 h-8" />}
              title="No Open Matches Found"
              description="We compared your resume with our open job listings. Adjust your title preferences or check back once new jobs are ingested."
            />
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map((item) => (
                <Card key={item.jobId} hoverable className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-yc-text">{item.title}</h3>
                      <p className="text-xs text-yc-text-secondary mt-0.5">
                        {item.company || 'Tech Startup'} • {item.location || 'San Francisco, CA'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="success">
                        <Sparkles className="w-3 h-3 mr-0.5" />
                        {Math.round(item.score * 100)}% Match
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-yc-border-subtle text-[11px] text-yc-text-muted">
                    <div className="flex items-center gap-3">
                      <span>Vector: {Math.round(item.embedScore * 100)}%</span>
                      <span>Skills: {Math.round(item.keywordScore * 100)}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.applyUrl && (
                        <a
                          href={item.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button size="sm" variant="primary">
                            Apply on ATS <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Sidebar Panels) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume Snapshot */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Resume Status</CardTitle>
              {hasResume ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="warning">Missing</Badge>
              )}
            </CardHeader>

            {hasResume ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-yc-text-secondary py-1 border-b border-yc-border-subtle">
                  <span>Candidate Name:</span>
                  <span className="font-medium text-yc-text">{user?.resume?.fullName || user?.name}</span>
                </div>
                <div className="flex items-center justify-between text-yc-text-secondary py-1 border-b border-yc-border-subtle">
                  <span>Email:</span>
                  <span className="font-medium text-yc-text">{user?.resume?.email || user?.email}</span>
                </div>
                <div className="flex items-center justify-between text-yc-text-secondary py-1 border-b border-yc-border-subtle">
                  <span>Experience:</span>
                  <span className="font-medium text-yc-text">{user?.resume?.totalYearsExperience || 0} years</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link to="/profile" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-yc-text-secondary">
                Upload your resume PDF to automatically extract career information and generate AI embeddings.
              </p>
            )}
          </Card>

          {/* Quick Preferences */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Matching Engine Preferences</CardTitle>
              <Link to="/automation" className="text-xs text-yc-orange hover:underline font-medium">
                Edit
              </Link>
            </CardHeader>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-yc-text-secondary">
                <span>ATS Sources:</span>
                <span className="font-medium text-yc-text">Greenhouse, Lever</span>
              </div>
              <div className="flex items-center justify-between text-yc-text-secondary">
                <span>Location Filter:</span>
                <span className="font-medium text-yc-text">
                  {user?.preferences?.locations?.length ? user.preferences.locations.join(', ') : 'All Locations'}
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

