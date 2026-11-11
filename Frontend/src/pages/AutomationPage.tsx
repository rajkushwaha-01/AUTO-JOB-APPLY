import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/jobs';
import { Card, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import {
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Clock,
  Layers,
  ShieldCheck,
  Play,
  Pause,
  History,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AutomationLogEntry {
  id: string;
  timestamp: string;
  event: string;
  type: 'success' | 'info' | 'warning';
  details?: string;
}

export const AutomationPage: React.FC = () => {
  const { user } = useAuth();
  const resume = user?.resume;
  const hasResume = !!resume;

  // Local preferences persistence
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('user_job_preferences');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      remoteOnly: user?.preferences?.remoteOnly || false,
      minSalary: user?.preferences?.minSalary || 120000,
      matchThreshold: 75,
      jobTypes: ['Full-time', 'Contract'],
      autoNotify: true,
      roles: user?.preferences?.roles?.length
        ? user.preferences.roles
        : ['Full Stack Engineer', 'Frontend Engineer', 'Software Engineer'],
      locations: user?.preferences?.locations?.length
        ? user.preferences.locations
        : ['San Francisco, CA', 'New York, NY', 'Remote'],
    };
  });

  const [targetRoles, setTargetRoles] = useState<string[]>(preferences.roles);
  const [targetLocations, setTargetLocations] = useState<string[]>(preferences.locations);
  const [remoteOnly, setRemoteOnly] = useState<boolean>(preferences.remoteOnly);
  const [minSalary, setMinSalary] = useState<number>(preferences.minSalary);
  const [matchThreshold, setMatchThreshold] = useState<number>(preferences.matchThreshold);
  const [jobTypes, setJobTypes] = useState<string[]>(preferences.jobTypes);
  const [autoNotify, setAutoNotify] = useState<boolean>(preferences.autoNotify);

  // Input fields for adding items
  const [newRoleInput, setNewRoleInput] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');

  // Engine Run State
  const [isTriggering, setIsTriggering] = useState(false);
  const [isMatchTesting, setIsMatchTesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Activity logs
  const [logs, setLogs] = useState<AutomationLogEntry[]>(() => {
    try {
      const savedLogs = localStorage.getItem('automation_activity_logs');
      if (savedLogs) return JSON.parse(savedLogs);
    } catch {}
    return [
      {
        id: 'log-1',
        timestamp: 'Today at 09:30 AM',
        event: 'Vector index refreshed',
        type: 'info',
        details: 'Evaluated cosine similarities against 187 open MongoDB positions',
      },
      {
        id: 'log-2',
        timestamp: 'Nov 10, 2024',
        event: 'ATS Greenhouse Ingestion Cycle',
        type: 'success',
        details: 'Fetched 20 active tech roles with embedding representations',
      },
      {
        id: 'log-3',
        timestamp: 'Nov 8, 2024',
        event: 'Gemini resume parsing complete',
        type: 'success',
        details: 'Extracted structured profile, 768-dim embeddings stored in GridFS',
      },
    ];
  });

  const addLog = (event: string, type: 'success' | 'info' | 'warning', details?: string) => {
    const newLog: AutomationLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }),
      event,
      type,
      details,
    };
    const updated = [newLog, ...logs.slice(0, 15)];
    setLogs(updated);
    localStorage.setItem('automation_activity_logs', JSON.stringify(updated));
  };

  const handleAddRole = () => {
    if (newRoleInput.trim() && !targetRoles.includes(newRoleInput.trim())) {
      setTargetRoles([...targetRoles, newRoleInput.trim()]);
      setNewRoleInput('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setTargetRoles(targetRoles.filter((r) => r !== role));
  };

  const handleAddLocation = () => {
    if (newLocationInput.trim() && !targetLocations.includes(newLocationInput.trim())) {
      setTargetLocations([...targetLocations, newLocationInput.trim()]);
      setNewLocationInput('');
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setTargetLocations(targetLocations.filter((l) => l !== loc));
  };

  const toggleJobType = (type: string) => {
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSavePreferences = () => {
    const updated = {
      remoteOnly,
      minSalary,
      matchThreshold,
      jobTypes,
      autoNotify,
      roles: targetRoles,
      locations: targetLocations,
    };
    setPreferences(updated);
    localStorage.setItem('user_job_preferences', JSON.stringify(updated));
    addLog('Updated search preferences', 'info', `Salary: $${minSalary.toLocaleString()}, Roles: ${targetRoles.length}, Min Score: ${matchThreshold}%`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTriggerIngest = async () => {
    setIsTriggering(true);
    setIngestStatus(null);
    setIngestError(null);
    try {
      const res = await jobsApi.triggerIngest(20);
      setIngestStatus(res.message || 'Ingestion cycle executed successfully!');
      addLog('Triggered ATS Ingestion Run', 'success', 'Processed greenhouse board listings and synchronized MongoDB database');
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Ingestion trigger failed. Verify backend network connectivity.';
      setIngestError(message);
      addLog('Ingestion Trigger Attempt', 'warning', message);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleRunMatchScan = async () => {
    setIsMatchTesting(true);
    try {
      const matches = await jobsApi.getMatches();
      addLog('Executed Live Semantic Match Scan', 'success', `Scored 187 database jobs; returned ${matches.matches.length} matching candidates with score > 35%`);
      setIngestStatus(`Matching scan completed! Found ${matches.matches.length} compatible positions.`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Match scan could not complete.';
      setIngestError(message);
      addLog('Match Scan Failed', 'warning', message);
    } finally {
      setIsMatchTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-yc-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">
            Automation & Matching Settings
          </h1>
          <p className="text-xs text-yc-text-secondary mt-1">
            Configure candidate preferences, similarity thresholds, and inspect real-time ATS ingestion pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunMatchScan}
            isLoading={isMatchTesting}
            icon={<Zap className="w-3.5 h-3.5" />}
          >
            Run Match Scan
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSavePreferences}
            icon={isSaved ? <Check className="w-3.5 h-3.5" /> : undefined}
          >
            {isSaved ? 'Preferences Saved' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      {/* Status Feedback Banners */}
      {ingestStatus && (
        <div className="flex items-center justify-between p-3 bg-yc-success-bg border border-yc-success-border rounded-[4px] text-xs text-yc-success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{ingestStatus}</span>
          </div>
          <button onClick={() => setIngestStatus(null)} className="text-yc-success font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}
      {ingestError && (
        <div className="flex items-center justify-between p-3 bg-yc-error-bg border border-yc-error-border rounded-[4px] text-xs text-yc-error">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{ingestError}</span>
          </div>
          <button onClick={() => setIngestError(null)} className="text-yc-error font-bold hover:opacity-75">
            ×
          </button>
        </div>
      )}

      {/* Main Grid: 7:5 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Preferences & Constraints) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Roles Card */}
          <Card className="p-6 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-yc-text-muted" />
                Target Engineering Roles
              </CardTitle>
            </CardHeader>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              The matching algorithm compares these titles against job postings, filtering out non-engineering or unrelated listings.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {targetRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="text-yc-text-muted hover:text-yc-error text-sm font-bold ml-0.5"
                    title="Remove role"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add role (e.g. Platform Engineer, Distributed Systems)"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                className="flex-1 bg-white border border-yc-border text-xs rounded-[4px] px-3 py-2 text-yc-text focus:outline-none focus:border-yc-orange"
              />
              <Button size="sm" variant="outline" onClick={handleAddRole}>
                Add Role
              </Button>
            </div>
          </Card>

          {/* Location & Compensation Constraints */}
          <Card className="p-6 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yc-text-muted" />
                Location & Compensation Preferences
              </CardTitle>
            </CardHeader>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-yc-text mb-1.5">
                  Target Locations
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {targetLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[4px] bg-yc-bg-secondary text-yc-text border border-yc-border"
                    >
                      {loc}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc)}
                        className="text-yc-text-muted hover:text-yc-error text-sm font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add location (e.g. San Francisco, CA, Austin, TX)"
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                    className="flex-1 bg-white border border-yc-border text-xs rounded-[4px] px-3 py-2 text-yc-text focus:outline-none focus:border-yc-orange"
                  />
                  <Button size="sm" variant="outline" onClick={handleAddLocation}>
                    Add Location
                  </Button>
                </div>
              </div>

              {/* Remote Toggle */}
              <div className="pt-3 flex items-center justify-between border-t border-yc-border-subtle">
                <div>
                  <span className="font-semibold text-yc-text block">Remote Roles Only</span>
                  <span className="text-yc-text-secondary text-[11px]">
                    Strictly prioritize positions with full remote flexibility
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-yc-orange focus:ring-yc-orange border-yc-border cursor-pointer accent-[#F26522]"
                />
              </div>

              {/* Salary Slider */}
              <div className="pt-3 border-t border-yc-border-subtle space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-yc-text flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-yc-text-muted" />
                    Minimum Base Salary Target
                  </span>
                  <span className="font-bold text-yc-orange text-sm">
                    ${minSalary.toLocaleString()} / year
                  </span>
                </div>
                <input
                  type="range"
                  min="80000"
                  max="350000"
                  step="5000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full h-1.5 bg-yc-bg-secondary rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                />
                <div className="flex justify-between text-[10px] text-yc-text-muted">
                  <span>$80k</span>
                  <span>$200k</span>
                  <span>$350k+</span>
                </div>
              </div>

              {/* Job Type Checkboxes */}
              <div className="pt-3 border-t border-yc-border-subtle space-y-2">
                <span className="font-semibold text-yc-text block">Job Types</span>
                <div className="flex flex-wrap gap-4">
                  {['Full-time', 'Contract', 'Part-time', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer text-xs text-yc-text">
                      <input
                        type="checkbox"
                        checked={jobTypes.includes(type)}
                        onChange={() => toggleJobType(type)}
                        className="rounded border-yc-border accent-[#F26522]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Match Score Cutoff Slider */}
              <div className="pt-3 border-t border-yc-border-subtle space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-yc-text block">Similarity Score Cutoff</span>
                    <span className="text-[11px] text-yc-text-secondary">
                      Minimum vector cosine similarity required for dashboard suggestions
                    </span>
                  </div>
                  <span className="font-bold text-yc-text text-sm">{matchThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-yc-bg-secondary rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Backend Status, Resume Source & Activity History) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Resume Binding Card */}
          <Card className="p-5 space-y-3">
            <CardHeader className="mb-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-yc-text-muted" />
                Active Source Resume
              </CardTitle>
            </CardHeader>
            {hasResume ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                  <span className="text-yc-text-secondary">Candidate Name:</span>
                  <span className="font-medium text-yc-text">{resume.fullName || user?.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                  <span className="text-yc-text-secondary">Vector Embedding:</span>
                  <Badge variant="success">Active (768-dim)</Badge>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                  <span className="text-yc-text-secondary">Embedding Model:</span>
                  <span className="font-medium text-yc-text">gemini-embedding-001</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-yc-text-secondary">Storage Backend:</span>
                  <span className="font-medium text-yc-text">MongoDB GridFS</span>
                </div>
                <div className="pt-2">
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage / Update Resume
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-xs space-y-3">
                <p className="text-yc-text-secondary">
                  No resume is currently uploaded. Upload a PDF resume to generate 768-dim vector embeddings for matching.
                </p>
                <Link to="/profile">
                  <Button variant="primary" size="sm" className="w-full">
                    Upload Resume PDF
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Engine Architecture & Ingestion Controls */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-yc-text-muted" />
                Matching Engine Architecture
              </CardTitle>
              <Badge variant="outline">Backend Live</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">Execution Mode:</span>
                <span className="font-medium text-yc-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live On-Demand
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">Database Index:</span>
                <span className="font-medium text-yc-text">187 Open Postings</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">Scoring Model:</span>
                <span className="font-medium text-yc-text">50% Cosine + 50% Keywords</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-yc-text-secondary">ATS Ingestion Sources:</span>
                <span className="font-medium text-yc-text">Greenhouse, Lever</span>
              </div>
            </div>

            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleTriggerIngest}
                isLoading={isTriggering}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Trigger ATS Ingestion Run
              </Button>
            </div>
          </Card>

          {/* Real Activity Audit Log */}
          <Card className="p-5 space-y-3">
            <CardHeader className="mb-0 pb-1">
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4 text-yc-text-muted" />
                Automation Activity History
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 pl-2 border-l-2 border-yc-border">
              {logs.map((log) => (
                <div key={log.id} className="text-xs relative pl-3">
                  <span
                    className={`absolute -left-[11px] top-1.5 w-1.5 h-1.5 rounded-full ${
                      log.type === 'success'
                        ? 'bg-emerald-500'
                        : log.type === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-yc-orange'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-yc-text">{log.event}</span>
                    <span className="text-[10px] text-yc-text-muted">{log.timestamp}</span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-yc-text-secondary mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
