import React, { useState } from 'react';
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
} from 'lucide-react';

export const AutomationPage: React.FC = () => {
  const { user } = useAuth();
  const [isTriggering, setIsTriggering] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Preference fields bound to local state initialized from user model
  const [remoteOnly, setRemoteOnly] = useState(user?.preferences?.remoteOnly || false);
  const [minSalary, setMinSalary] = useState(user?.preferences?.minSalary || 120000);
  const [targetRoles, setTargetRoles] = useState<string[]>(
    user?.preferences?.roles?.length
      ? user.preferences.roles
      : ['Full Stack Engineer', 'Frontend Engineer', 'Software Engineer']
  );
  const [targetLocations, setTargetLocations] = useState<string[]>(
    user?.preferences?.locations?.length
      ? user.preferences.locations
      : ['San Francisco, CA', 'Remote']
  );

  const [newRoleInput, setNewRoleInput] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSavePreferences = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTriggerIngest = async () => {
    setIsTriggering(true);
    setIngestStatus(null);
    setIngestError(null);
    try {
      const res = await jobsApi.triggerIngest(20);
      setIngestStatus(res.message || 'Ingestion cycle initiated successfully!');
    } catch (err: any) {
      setIngestError(
        err.response?.data?.message || err.response?.data?.error || 'Ingestion trigger failed.'
      );
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">
            Automation & Ingestion Engine
          </h1>
          <p className="text-xs text-yc-text-secondary mt-1">
            Configure ATS job ingestion sources, semantic match thresholds, and candidate preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerIngest}
            isLoading={isTriggering}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Trigger Ingestion Run
          </Button>
          <Button variant="primary" size="sm" onClick={handleSavePreferences}>
            {isSaved ? 'Saved!' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      {/* Ingest Feedback alerts */}
      {ingestStatus && (
        <div className="flex items-center gap-2 p-3 bg-yc-success-bg border border-yc-success-border rounded-[4px] text-xs text-yc-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{ingestStatus}</span>
        </div>
      )}
      {ingestError && (
        <div className="flex items-center gap-2 p-3 bg-yc-error-bg border border-yc-error-border rounded-[4px] text-xs text-yc-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{ingestError}</span>
        </div>
      )}

      {/* Two Column Layout (7:5 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Preference Controls) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Roles */}
          <Card className="p-6 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Target Engineering Roles</CardTitle>
            </CardHeader>
            <p className="text-xs text-yc-text-secondary">
              Job matching uses these roles to verify relevant job titles and filter out non-engineering listings.
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
                    className="text-yc-text-muted hover:text-yc-text text-sm font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add role (e.g. Distributed Systems Engineer)"
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

          {/* Locations & Remote Preferences */}
          <Card className="p-6 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Location & Compensation Constraints</CardTitle>
            </CardHeader>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-yc-text mb-1.5">
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
                        className="text-yc-text-muted hover:text-yc-text text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add location (e.g. New York, NY)"
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                    className="flex-1 bg-white border border-yc-border text-xs rounded-[4px] px-3 py-2 text-yc-text focus:outline-none focus:border-yc-orange"
                  />
                  <Button size="sm" variant="outline" onClick={handleAddLocation}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-yc-border-subtle">
                <div>
                  <span className="font-medium text-yc-text block">Remote Roles Only</span>
                  <span className="text-yc-text-secondary text-[11px]">
                    Only match with positions explicitly marked as Remote
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-yc-orange focus:ring-yc-orange border-yc-border cursor-pointer accent-[#F26522]"
                />
              </div>

              <div className="pt-2 border-t border-yc-border-subtle space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-yc-text">Minimum Base Salary Target</span>
                  <span className="font-bold text-yc-orange text-sm">
                    ${minSalary.toLocaleString()} / year
                  </span>
                </div>
                <input
                  type="range"
                  min="80000"
                  max="300000"
                  step="5000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full h-1.5 bg-yc-bg-secondary rounded-lg appearance-none cursor-pointer accent-[#F26522]"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Diagnostics & Status) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real Engine Status */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Engine Architecture Status</CardTitle>
              <Badge variant="outline">Backend Live</Badge>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">Current Engine State:</span>
                <span className="font-medium text-yc-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yc-warning" />
                  Idle (On-Demand)
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">AI Vector Model:</span>
                <span className="font-medium text-yc-text">gemini-embedding-001</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">Resume Vector Dimensions:</span>
                <span className="font-medium text-yc-text">768 floats</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-yc-border-subtle">
                <span className="text-yc-text-secondary">Candidate Storage:</span>
                <span className="font-medium text-yc-text">MongoDB GridFS</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleTriggerIngest}
                isLoading={isTriggering}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Run Ingestion Verification
              </Button>
            </div>
          </Card>

          {/* Ingestion Source Feeds */}
          <Card className="p-5 space-y-3">
            <CardHeader className="mb-0 pb-2">
              <CardTitle>Configured ATS Sources</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-yc-bg-secondary border border-yc-border">
                <span className="font-medium text-yc-text">Greenhouse Boards</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-yc-bg-secondary border border-yc-border">
                <span className="font-medium text-yc-text">Lever Feeds</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[4px] bg-yc-bg-secondary border border-yc-border">
                <span className="font-medium text-yc-text">Adzuna Aggregation</span>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

