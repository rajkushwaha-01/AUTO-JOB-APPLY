import React, { useState } from 'react';
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
} from 'lucide-react';

export interface TrackedApplication {
  id: string;
  role: string;
  company: string;
  appliedDate: string;
  source: string;
  status: 'Applied' | 'In Review' | 'Interviewing' | 'Offer' | 'Archived';
  notes?: string;
  applyUrl?: string;
}

const DEFAULT_APPLICATIONS: TrackedApplication[] = [
  {
    id: 'app-1',
    role: 'Senior Full Stack Engineer',
    company: 'Scale AI',
    appliedDate: 'Nov 8, 2024',
    source: 'Greenhouse',
    status: 'Interviewing',
    notes: 'Technical architecture screen scheduled',
    applyUrl: 'https://boards.greenhouse.io',
  },
  {
    id: 'app-2',
    role: 'Frontend Engineer, Core',
    company: 'Linear',
    appliedDate: 'Nov 6, 2024',
    source: 'Lever',
    status: 'In Review',
    notes: 'Submitted with portfolio links',
    applyUrl: 'https://jobs.lever.co',
  },
  {
    id: 'app-3',
    role: 'Backend Engineer, Platform',
    company: 'Supabase',
    appliedDate: 'Nov 3, 2024',
    source: 'Greenhouse',
    status: 'Applied',
    notes: 'Direct application via matching engine',
    applyUrl: 'https://boards.greenhouse.io',
  },
];

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<TrackedApplication[]>(() => {
    const saved = localStorage.getItem('tracked_applications');
    return saved ? JSON.parse(saved) : DEFAULT_APPLICATIONS;
  });

  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New application form state
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSource, setNewSource] = useState('Greenhouse');
  const [newStatus, setNewStatus] = useState<TrackedApplication['status']>('Applied');
  const [newNotes, setNewNotes] = useState('');

  const saveApplications = (apps: TrackedApplication[]) => {
    setApplications(apps);
    localStorage.setItem('tracked_applications', JSON.stringify(apps));
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;

    const newApp: TrackedApplication = {
      id: `app-${Date.now()}`,
      role: newRole.trim(),
      company: newCompany.trim(),
      appliedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      source: newSource,
      status: newStatus,
      notes: newNotes.trim() || undefined,
    };

    saveApplications([newApp, ...applications]);
    setIsAddModalOpen(false);
    setNewRole('');
    setNewCompany('');
    setNewNotes('');
  };

  const updateStatus = (id: string, status: TrackedApplication['status']) => {
    const updated = applications.map((app) => (app.id === id ? { ...app, status } : app));
    saveApplications(updated);
  };

  const tabs = [
    { label: 'All', count: applications.length },
    { label: 'Applied', count: applications.filter((a) => a.status === 'Applied').length },
    { label: 'In Review', count: applications.filter((a) => a.status === 'In Review').length },
    { label: 'Interviewing', count: applications.filter((a) => a.status === 'Interviewing').length },
    { label: 'Offer', count: applications.filter((a) => a.status === 'Offer').length },
    { label: 'Archived', count: applications.filter((a) => a.status === 'Archived').length },
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesTab = activeTab === 'All' || app.status === activeTab;
    const matchesQuery =
      !searchQuery ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const getStatusBadge = (status: TrackedApplication['status']) => {
    switch (status) {
      case 'Interviewing':
        return <Badge variant="warning">Interviewing</Badge>;
      case 'Offer':
        return <Badge variant="success">Offer Received</Badge>;
      case 'In Review':
        return <Badge variant="orange">In Review</Badge>;
      case 'Applied':
        return <Badge variant="default">Applied</Badge>;
      case 'Archived':
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-yc-text">
            Applications Management
          </h1>
          <p className="text-xs text-yc-text-secondary mt-1">
            Track and manage your submitted job applications and interview milestones.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          + Track Application
        </Button>
      </div>

      {/* Segmented Pipeline Tabs */}
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
            {tab.label} ({tab.count})
            {activeTab === tab.label && (
              <span className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-yc-orange" />
            )}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <span className="text-xs text-yc-text-secondary">
          Showing {filteredApplications.length} of {applications.length} applications
        </span>
      </div>

      {/* Data Table */}
      <Card className="p-0 overflow-hidden border border-yc-border">
        {filteredApplications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-8 h-8" />}
            title="No applications in this category"
            description="Track applications you submit across Greenhouse, Lever, and other ATS platforms."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-yc-bg-secondary border-b border-yc-border text-[11px] uppercase tracking-wider text-yc-text-secondary font-semibold">
                <tr>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Date Applied</th>
                  <th className="py-3 px-4">ATS Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Activity</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yc-border-subtle">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-yc-bg-subtle transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-yc-text">{app.role}</div>
                      <div className="text-yc-text-secondary text-[11px] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-yc-text-muted" />
                        {app.company}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-yc-text-secondary whitespace-nowrap">
                      {app.appliedDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-yc-text font-medium">{app.source}</span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3.5 px-4 text-yc-text-secondary max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateStatus(app.id, e.target.value as TrackedApplication['status'])
                        }
                        className="bg-white border border-yc-border text-xs rounded-[4px] px-2 py-1 text-yc-text focus:outline-none focus:border-yc-orange"
                      >
                        <option value="Applied">Applied</option>
                        <option value="In Review">In Review</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
            label="Job Role Title"
            placeholder="e.g. Senior Software Engineer"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            required
          />

          <Input
            label="Company Name"
            placeholder="e.g. Scale AI"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            required
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
                <option value="Direct ATS">Direct ATS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-yc-text mb-1.5">Current Status</label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as TrackedApplication['status'])
                }
                className="w-full h-9 px-3 bg-white border border-yc-border rounded-[4px] text-yc-text text-sm focus:outline-none focus:border-yc-orange"
              >
                <option value="Applied">Applied</option>
                <option value="In Review">In Review</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
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

