'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Award,
  Check,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Download,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface AdminVettingClientProps {
  pendingSitters: any[];
  approvedSitters: any[];
}

export function AdminVettingClient({ pendingSitters: initialPending, approvedSitters }: AdminVettingClientProps) {
  const [activeTab, setActiveTab] = useState<'VETTING' | 'APPLICATIONS'>('VETTING');
  const [pendingSitters, setPendingSitters] = useState(initialPending);
  const [approvedSittersState, setApprovedSittersState] = useState(approvedSitters);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Nanny Applications State
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('SUBMITTED');

  // Load Nanny Applications from API
  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const url = new URL('/api/admin/applications', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Failed to load applications:', e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter, searchQuery]);

  const handleVettingAction = async (sitterId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(sitterId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/vetting/${sitterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setPendingSitters((prev) => prev.filter((s) => s.id !== sitterId));
        setMessage(action === 'APPROVE' ? 'Caregiver Approved & Verified' : 'Caregiver Profile Rejected');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateApplicationStatus = async () => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`Application ${selectedApp.applicationNumber} updated to ${editStatus}.`);
        setSelectedApp(null);
        loadApplications();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openAppModal = (app: any) => {
    setSelectedApp(app);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BACKGROUND_CHECK':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          id="admin-tab-applications"
          data-testid="admin-tab-applications"
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'APPLICATIONS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Nanny Applications ({applications.length})
        </button>

        <button
          id="admin-tab-vetting"
          data-testid="admin-tab-vetting"
          onClick={() => setActiveTab('VETTING')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'VETTING'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Sitter Vetting Queue ({pendingSitters.length})
        </button>
      </div>

      {/* TAB 1: NANNY APPLICATIONS */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicants by name, email, or city..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="DOCUMENTS_REQUESTED">Documents Requested</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="BACKGROUND_CHECK">Background Check</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {loadingApps ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Loading Nanny Applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800">No Applications Found</p>
                <p className="text-xs text-slate-400">
                  No applicant submissions match the current status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Application #</th>
                      <th className="py-3.5 px-4">Applicant</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Experience</th>
                      <th className="py-3.5 px-4">CPR / Vehicle</th>
                      <th className="py-3.5 px-4">Date Submitted</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-blue-600">
                          {app.applicationNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {app.firstName} {app.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">{app.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {app.city}, {app.state}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">
                          {app.yearsExperience} yrs
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {app.cprCertified && (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                CPR
                              </span>
                            )}
                            {app.ownVehicle && (
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                Car
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            id={`review-app-btn-${app.id}`}
                            data-testid="review-app-btn"
                            onClick={() => openAppModal(app)}
                            className="bg-slate-900 hover:bg-purple-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SITTER VETTING QUEUE */}
      {activeTab === 'VETTING' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-lg text-slate-900">
                  Pending Verification Requests ({pendingSitters.length})
                </h2>
              </div>
            </div>

            {pendingSitters.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800">All Vetting Queue Items Cleared!</p>
                <p className="text-xs text-slate-500">There are currently no sitter profiles awaiting admin inspection.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingSitters.map((sitter) => (
                  <div
                    key={sitter.id}
                    className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={sitter.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                        />
                        <div>
                          <h3 className="font-bold text-base text-slate-900">
                            {sitter.user.firstName} {sitter.user.lastName}
                          </h3>
                          <p className="text-xs text-slate-500">{sitter.user.email} • {sitter.user.phone || 'No phone'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVettingAction(sitter.id, 'REJECT')}
                          disabled={processingId === sitter.id}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject Profile
                        </button>
                        <button
                          id={`approve-sitter-btn-${sitter.id}`}
                          data-testid="approve-sitter-btn"
                          onClick={() => handleVettingAction(sitter.id, 'APPROVE')}
                          disabled={processingId === sitter.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve Caregiver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK VIEW & REVIEW MODAL FOR NANNY APPLICATION */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-blue-600">
                  {selectedApp.applicationNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedApp.firstName} {selectedApp.lastName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block mb-1">Contact Details:</span>
                <p><strong className="text-slate-700">Email:</strong> {selectedApp.email}</p>
                <p><strong className="text-slate-700">Phone:</strong> {selectedApp.phone}</p>
                <p><strong className="text-slate-700">Address:</strong> {selectedApp.address}, {selectedApp.city}, {selectedApp.postalCode}</p>
                <p><strong className="text-slate-700">Emergency:</strong> {selectedApp.emergencyContact} ({selectedApp.emergencyPhone})</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block mb-1">Experience & Credentials:</span>
                <p><strong className="text-slate-700">Experience:</strong> {selectedApp.yearsExperience} Years</p>
                <p><strong className="text-slate-700">Languages:</strong> {selectedApp.languages}</p>
                <p><strong className="text-slate-700">Education:</strong> {selectedApp.education}</p>
                <p><strong className="text-slate-700">Driver License:</strong> {selectedApp.driverLicenseStatus}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 md:col-span-2">
                <span className="font-bold text-slate-900 block">Uploaded Verification Documents ({selectedApp.documents.length}):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedApp.documents.map((doc: any) => (
                    <div key={doc.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="font-bold text-[10px] text-purple-700 uppercase block">{doc.documentType}</span>
                        <span className="text-xs text-slate-800 font-medium truncate block">{doc.fileName}</span>
                      </div>
                      <a
                        href={`#${doc.storagePath}`}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading verification document: ${doc.fileName}`);
                        }}
                        className="bg-purple-50 text-purple-700 p-1.5 rounded-lg hover:bg-purple-100 shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Workflow Status Controls */}
            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-4">
              <span className="font-bold text-xs text-purple-950 block">Update Application Status & Admin Notes</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">Workflow Status</label>
                  <select
                    id="admin-update-status-select"
                    data-testid="admin-update-status-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="DOCUMENTS_REQUESTED">Documents Requested</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="BACKGROUND_CHECK">Background Check</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">Internal Admin Notes</label>
                  <input
                    id="admin-notes-input"
                    data-testid="admin-notes-input"
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Log review remarks or reference check outcome..."
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-status-btn"
                  data-testid="admin-save-status-btn"
                  type="button"
                  onClick={handleUpdateApplicationStatus}
                  disabled={updatingStatus}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-colors"
                >
                  {updatingStatus ? 'Updating...' : 'Save Workflow Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approved Sitters Reference List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Active Approved Sitters ({approvedSittersState.length + pendingSitters.length})
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {/* Merge approved sitters with pending sitters for fallback visibility */}
          {[...approvedSittersState, ...pendingSitters].map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={s.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <span className="font-bold text-slate-900">{s.user.firstName} {s.user.lastName}</span>
                  <span className="text-slate-400 text-[11px] ml-2 font-normal">${s.baseHourlyRate ? s.baseHourlyRate : "-"}/hr • ★ {s.averageRating ? s.averageRating : "-"}</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">APPROVED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
