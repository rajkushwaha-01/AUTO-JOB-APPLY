import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  Plus,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Calendar,
  Building,
  Trash2,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  Clock,
  CheckSquare,
  XCircle,
  FileText,
} from 'lucide-react';

export type ApplicationStatus =
  | 'Applied'
  | 'Pending'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Archived';

export interface ApplicationHistoryEvent {
  date: string;
  action: string;
  note?: string;
}

export interface TrackedApplication {
  id: string;
  role: string;
  company: string;
  appliedDate: string;
  source: string;
  status: ApplicationStatus;
  notes?: string;
  applyUrl?: string;
  history?: ApplicationHistoryEvent[];
}

const DEFAULT_APPLICATIONS: TrackedApplication[] = [
  {
    id: 'app-1',
    role: 'Senior Full Stack Engineer',
    company: 'Scale AI',
    appliedDate: 'Nov 8, 2024',
    source: 'Greenhouse',
    status: 'Interview',
    notes: 'Technical architecture screen scheduled for Thursday 2 PM EST.',
    applyUrl: 'https://boards.greenhouse.io',
    history: [
      { date: 'Nov 8, 2024', action: 'Applied via Greenhouse matching' },
      { date: 'Nov 10, 2024', action: 'Recruiter reached out for technical screen' },
    ],
  },
  {
    id: 'app-2',
    role: 'Frontend Engineer, Core',
    company: 'Linear',
    appliedDate: 'Nov 6, 2024',
    source: 'Lever',
    status: 'Pending',
    notes: 'Submitted resume and portfolio showcasing React and TypeScript work.',
    applyUrl: 'https://jobs.lever.co',
    history: [{ date: 'Nov 6, 2024', action: 'Application submitted via Lever ATS' }],
  },
  {
    id: 'app-3',
    role: 'Backend Engineer, Platform',
    company: 'Supabase',
    appliedDate: 'Nov 3, 2024',
    source: 'Greenhouse',
    status: 'Applied',
    notes: 'Matched with 88% vector score from profile embeddings.',
    applyUrl: 'https://boards.greenhouse.io',
    history: [{ date: 'Nov 3, 2024', action: 'Matched and applied' }],
  },
  {
    id: 'app-4',
    role: 'Staff Infrastructure Engineer',
    company: 'Vercel',
    appliedDate: 'Oct 28, 2024',
    source: 'Workday',
    status: 'Accepted',
    notes: 'Offer letter received! Reviewing compensation package.',
    applyUrl: 'https://vercel.com/careers',
    history: [
      { date: 'Oct 28, 2024', action: 'Application submitted' },
      { date: 'Nov 2, 2024', action: 'System design interview passed' },
      { date: 'Nov 7, 2024', action: 'Official offer extended' },
    ],
  },
];

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<TrackedApplication[]>(() => {
    try {
      const saved = localStorage.getItem('tracked_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize any legacy statuses (e.g. 'In Review' -> 'Pending', 'Offer' -> 'Accepted')
        return parsed.map((app: any) => ({
          ...app,
          status:
            app.status === 'In Review'
              ? 'Pending'
              : app.status === 'Offer'
              ? 'Accepted'
              : app.status || 'Applied',
        }));
      }
      return DEFAULT_APPLICATIONS;
    } catch {
      return DEFAULT_APPLICATIONS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company' | 'role'>('newest');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<TrackedApplication | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // New application form
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSource, setNewSource] = useState('Greenhouse');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied');
  const [newApplyUrl, setNewApplyUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Edit notes state in details modal
  const [editingNotes, setEditingNotes] = useState('');
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);

  const saveApplications = (apps: TrackedApplication[]) => {
    setApplications(apps);
    localStorage.setItem('tracked_applications', JSON.stringify(apps));
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newApp: TrackedApplication = {
      id: `app-${Date.now()}`,
      role: newRole.trim(),
      company: newCompany.trim(),
      appliedDate: today,
      source: newSource,
      status: newStatus,
      applyUrl: newApplyUrl.trim() || undefined,
      notes: newNotes.trim() || undefined,
      history: [
        {
          date: today,
          action: `Tracked application as "${newStatus}"`,
          note: newNotes.trim() || undefined,
        },
      ],
    };

    saveApplications([newApp, ...applications]);
    setIsAddModalOpen(false);
    setNewRole('');
    setNewCompany('');
    setNewApplyUrl('');
    setNewNotes('');
    setNewStatus('Applied');
  };

  const updateStatus = (id: string, status: ApplicationStatus) => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const updated = applications.map((app) => {
      if (app.id === id) {
        const history = app.history || [];
        return {
          ...app,
          status,
          history: [...history, { date: today, action: `Status updated to ${status}` }],
        };
      }
      return app;
    });

    saveApplications(updated);
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleSaveNotes = () => {
    if (!selectedApp) return;
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const updated = applications.map((app) => {
      if (app.id === selectedApp.id) {
        const history = app.history || [];
        return {
          ...app,
          notes: editingNotes.trim(),
          history: [...history, { date: today, action: 'Updated application notes' }],
        };
      }
      return app;
    });

    saveApplications(updated);
    setSelectedApp((prev) => (prev ? { ...prev, notes: editingNotes.trim() } : null));
    setNotesSavedAlert(true);
    setTimeout(() => setNotesSavedAlert(false), 2500);
  };

  const handleDeleteApplication = () => {
    if (!appToDelete) return;
    const updated = applications.filter((app) => app.id !== appToDelete);
    saveApplications(updated);
    setIsDeleteConfirmOpen(false);
    setAppToDelete(null);
    if (selectedApp && selectedApp.id === appToDelete) {
      setSelectedApp(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Role', 'Company', 'Applied Date', 'Source', 'Status', 'Notes', 'URL'];
    const rows = filteredApplications.map((app) => [
      `"${app.id}"`,
      `"${app.role.replace(/"/g, '""')}"`,
      `"${app.company.replace(/"/g, '""')}"`,
      `"${app.appliedDate}"`,
      `"${app.source}"`,
      `"${app.status}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`,
      `"${app.applyUrl || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pipeline tabs
  const tabs = [
    { label: 'All', count: applications.length },
    { label: 'Applied', count: applications.filter((a) => a.status === 'Applied').length },
    { label: 'Pending', count: applications.filter((a) => a.status === 'Pending').length },
    { label: 'Interview', count: applications.filter((a) => a.status === 'Interview').length },
    { label: 'Accepted', count: applications.filter((a) => a.status === 'Accepted').length },
    { label: 'Rejected', count: applications.filter((a) => a.status === 'Rejected').length },
    { label: 'Archived', count: applications.filter((a) => a.status === 'Archived').length },
  ];

  // Distinct sources
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => set.add(a.source));
    return ['All', ...Array.from(set)];
  }, [applications]);

  // Filtered & Sorted Applications
  const filteredApplications = useMemo(() => {
    let result = applications.filter((app) => {
      const matchesTab = activeTab === 'All' || app.status === activeTab;
      const matchesSource = sourceFilter === 'All' || app.source === sourceFilter;
      const matchesQuery =
        !searchQuery ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSource && matchesQuery;
    });

    return result.sort((a, b) => {
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      if (sortBy === 'role') return a.role.localeCompare(b.role);
      if (sortBy === 'oldest') return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
      // default newest
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });
  }, [applications, activeTab, sourceFilter, searchQuery, sortBy]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Interview':
        return <Badge variant="warning">Interview</Badge>;
      case 'Accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'Pending':
        return <Badge variant="orange">Pending</Badge>;
      case 'Applied':
        return <Badge variant="default">Applied</Badge>;
      case 'Rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'Archived':
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-yc-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">Applications Management</h1>
          
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Track Application
          </Button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border border-yc-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yc-text-secondary font-medium">Total Applied</span>
            <Briefcase className="w-4 h-4 text-yc-text-muted" />
          </div>
          <div className="text-2xl font-bold text-yc-text mt-1">{applications.length}</div>
        </Card>

        <Card className="p-4 bg-white border border-yc-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yc-text-secondary font-medium">Active Pipeline</span>
            <Clock className="w-4 h-4 text-yc-orange" />
          </div>
          <div className="text-2xl font-bold text-yc-text mt-1">
            {applications.filter((a) => a.status === 'Applied' || a.status === 'Pending').length}
          </div>
        </Card>

        <Card className="p-4 bg-white border border-yc-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yc-text-secondary font-medium">Interviewing</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-yc-text mt-1">
            {applications.filter((a) => a.status === 'Interview').length}
          </div>
        </Card>

        <Card className="p-4 bg-white border border-yc-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yc-text-secondary font-medium">Offers / Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-yc-success" />
          </div>
          <div className="text-2xl font-bold text-yc-text mt-1">
            {applications.filter((a) => a.status === 'Accepted').length}
          </div>
        </Card>
      </div>

      {/* Pipeline Status Tabs */}
      <div className="flex items-center gap-1 border-b border-yc-border overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-3 py-2 text-xs font-medium rounded-[4px] whitespace-nowrap transition-colors relative ${
              activeTab === tab.label
                ? 'text-yc-text font-semibold bg-yc-bg-secondary'
                : 'text-yc-text-secondary hover:text-yc-text'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.label
                  ? 'bg-yc-orange text-white font-bold'
                  : 'bg-yc-bg text-yc-text-secondary'
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.label && (
              <span className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-yc-orange" />
            )}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by role, company, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-yc-text-muted" />}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-xs text-yc-text-secondary">
            <Filter className="w-3.5 h-3.5 text-yc-text-muted" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 px-2.5 bg-white border border-yc-border rounded-[4px] text-xs text-yc-text focus:outline-none focus:border-yc-orange"
            >
              {availableSources.map((src) => (
                <option key={src} value={src}>
                  {src === 'All' ? 'All ATS Sources' : src}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-yc-text-secondary">
            <ArrowUpDown className="w-3.5 h-3.5 text-yc-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-2.5 bg-white border border-yc-border rounded-[4px] text-xs text-yc-text focus:outline-none focus:border-yc-orange"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="company">Company (A-Z)</option>
              <option value="role">Role (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden border border-yc-border">
        {filteredApplications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-8 h-8" />}
            title="No applications found"
            description={
              searchQuery || sourceFilter !== 'All' || activeTab !== 'All'
                ? 'Try clearing your search query or status filter to see more applications.'
                : 'Track applications you submit across Greenhouse, Lever, and other ATS platforms.'
            }
            action={
              searchQuery || sourceFilter !== 'All' || activeTab !== 'All' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSourceFilter('All');
                    setActiveTab('All');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                  + Track First Application
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-yc-bg-secondary border-b border-yc-border text-[11px] uppercase tracking-wider text-yc-text-secondary font-semibold">
                <tr>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Date Applied</th>
                  <th className="py-3 px-4">ATS Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Activity</th>
                  <th className="py-3 px-4">Update Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yc-border-subtle">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-yc-bg-subtle/80 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedApp(app);
                      setEditingNotes(app.notes || '');
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-yc-text flex items-center gap-1.5">
                        <span>{app.role}</span>
                        {app.applyUrl && (
                          <span
                            title="Direct ATS URL available"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(app.applyUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-yc-text-muted hover:text-yc-orange transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-yc-text-secondary text-[11px] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-yc-text-muted" />
                        <span>{app.company}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-yc-text-secondary whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-yc-text-muted" />
                        <span>{app.appliedDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-yc-text">{app.source}</span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>

                    <td className="py-3.5 px-4 text-yc-text-secondary max-w-xs truncate">
                      {app.notes ? (
                        <span className="flex items-center gap-1 text-yc-text">
                          <FileText className="w-3 h-3 text-yc-text-muted flex-shrink-0" />
                          <span className="truncate">{app.notes}</span>
                        </span>
                      ) : (
                        <span className="text-yc-text-muted">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateStatus(app.id, e.target.value as ApplicationStatus)
                        }
                        className="bg-white border border-yc-border text-xs rounded-[4px] px-2 py-1 text-yc-text focus:outline-none focus:border-yc-orange"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Pending">Pending</option>
                        <option value="Interview">Interview</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setEditingNotes(app.notes || '');
                          }}
                          title="View Details & Timeline"
                          className="p-1.5 text-yc-text-muted hover:text-yc-text rounded-[4px] hover:bg-yc-bg-secondary transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAppToDelete(app.id);
                            setIsDeleteConfirmOpen(true);
                          }}
                          title="Remove Application"
                          className="p-1.5 text-yc-text-muted hover:text-yc-error rounded-[4px] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info banner */}
        <div className="px-4 py-2.5 bg-yc-bg-secondary border-t border-yc-border flex items-center justify-between text-[11px] text-yc-text-secondary">
          <span>
            Showing {filteredApplications.length} of {applications.length} applications
          </span>
          <span className="hidden sm:inline">Click any row to view full application details and timeline</span>
        </div>
      </Card>

      {/* Application Details & Timeline Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={selectedApp.role}
          description={`Application history with ${selectedApp.company}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                className="text-yc-error hover:bg-red-50 hover:border-red-200"
                onClick={() => {
                  setAppToDelete(selectedApp.id);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                {selectedApp.applyUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedApp.applyUrl, '_blank', 'noopener,noreferrer')}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open ATS Page
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Quick Summary Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-yc-bg-secondary border border-yc-border rounded-[4px]">
              <div>
                <span className="text-yc-text-secondary">Company:</span>{' '}
                <span className="font-semibold text-yc-text">{selectedApp.company}</span>
              </div>
              <div>
                <span className="text-yc-text-secondary">Applied Date:</span>{' '}
                <span className="font-medium text-yc-text">{selectedApp.appliedDate}</span>
              </div>
              <div>
                <span className="text-yc-text-secondary">ATS Source:</span>{' '}
                <span className="font-medium text-yc-text">{selectedApp.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yc-text-secondary">Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) =>
                    updateStatus(selectedApp.id, e.target.value as ApplicationStatus)
                  }
                  className="bg-white border border-yc-border text-xs rounded-[4px] px-2 py-1 text-yc-text font-medium focus:outline-none focus:border-yc-orange"
                >
                  <option value="Applied">Applied</option>
                  <option value="Pending">Pending</option>
                  <option value="Interview">Interview</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Editable Notes Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-yc-text">Application Notes & Next Steps</label>
                {notesSavedAlert && (
                  <span className="text-[11px] text-yc-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Saved successfully
                  </span>
                )}
              </div>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Add interview feedback, recruiter contact info, salary discussions, or key milestones..."
                rows={3}
                className="w-full p-2.5 bg-white border border-yc-border rounded-[4px] text-xs text-yc-text focus:outline-none focus:border-yc-orange"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                  Save Note
                </Button>
              </div>
            </div>

            {/* Timeline / Activity History */}
            <div className="space-y-2 border-t border-yc-border pt-4">
              <h4 className="font-semibold text-yc-text flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-yc-text-muted" />
                Application History & Milestones
              </h4>
              <div className="space-y-2 pl-2 border-l-2 border-yc-border">
                {selectedApp.history && selectedApp.history.length > 0 ? (
                  selectedApp.history.map((item, index) => (
                    <div key={index} className="text-xs relative pl-3">
                      <span className="absolute -left-[11px] top-1.5 w-1.5 h-1.5 rounded-full bg-yc-orange" />
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-yc-text">{item.action}</span>
                        <span className="text-[10px] text-yc-text-muted">{item.date}</span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-yc-text-secondary mt-0.5">{item.note}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-yc-text-secondary pl-3">
                    Application tracked on {selectedApp.appliedDate}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Remove Application"
        description="Are you sure you want to delete this tracked application from your pipeline?"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-yc-error hover:bg-red-700 text-white"
              onClick={handleDeleteApplication}
            >
              Delete Application
            </Button>
          </>
        }
      >
        <p className="text-xs text-yc-text-secondary">
          This will permanently remove the application from your local tracking record. This action cannot be undone.
        </p>
      </Modal>

      {/* Add Application Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Track Job Application"
        description="Add a role you have applied to for tracking and follow-up reminders."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddApplication}>
              Save Application
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddApplication} className="space-y-3.5">
          <Input
            label="Job Role Title *"
            placeholder="e.g. Senior Software Engineer"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            required
          />

          <Input
            label="Company Name *"
            placeholder="e.g. Scale AI"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            required
          />

          <Input
            label="Application URL (Optional)"
            placeholder="https://boards.greenhouse.io/scaleai/jobs/..."
            value={newApplyUrl}
            onChange={(e) => setNewApplyUrl(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-yc-text mb-1.5">ATS Provider</label>
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text text-sm focus:outline-none focus:border-yc-orange"
              >
                <option value="Greenhouse">Greenhouse</option>
                <option value="Lever">Lever</option>
                <option value="Workday">Workday</option>
                <option value="Ashby">Ashby</option>
                <option value="Direct ATS">Direct ATS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-yc-text mb-1.5">Current Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                className="w-full h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text text-sm focus:outline-none focus:border-yc-orange"
              >
                <option value="Applied">Applied</option>
                <option value="Pending">Pending</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <Input
            label="Notes / Next Step"
            placeholder="e.g. Recruiter phone screen scheduled for Tuesday"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
