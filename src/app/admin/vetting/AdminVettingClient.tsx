'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, User, Award, Check, ExternalLink } from 'lucide-react';

interface AdminVettingClientProps {
  pendingSitters: any[];
  approvedSitters: any[];
}

export function AdminVettingClient({ pendingSitters: initialPending, approvedSitters }: AdminVettingClientProps) {
  const [pendingSitters, setPendingSitters] = useState(initialPending);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (sitterId: string, action: 'APPROVE' | 'REJECT') => {
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
        setMessage(`Sitter profile successfully ${action === 'APPROVE' ? 'APPROVED' : 'REJECTED'}.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Pending Vetting Section */}
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
                      onClick={() => handleAction(sitter.id, 'REJECT')}
                      disabled={processingId === sitter.id}
                      className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject Profile
                    </button>
                    <button
                      onClick={() => handleAction(sitter.id, 'APPROVE')}
                      disabled={processingId === sitter.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Sitter Profile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-800">Headline & Bio:</p>
                    <p className="text-slate-600 italic">"{sitter.headline}"</p>
                    <p className="text-slate-600 leading-relaxed">{sitter.bio}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-800">Uploaded Verification Documents:</p>
                    {sitter.idDocumentUrl ? (
                      <div className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                        <FileText className="w-4 h-4" />
                        <span>Government_ID_Chloe_Tremblay.pdf</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                      </div>
                    ) : (
                      <p className="text-slate-400">No document attached.</p>
                    )}

                    <p className="font-bold text-slate-800 pt-1">Reference Notes:</p>
                    <p className="text-slate-600">{sitter.referenceNotes || 'None logged.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Sitters Reference List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Active Approved Sitters ({approvedSitters.length})
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {approvedSitters.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={s.user.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <span className="font-bold text-slate-900">{s.user.firstName} {s.user.lastName}</span>
                  <span className="text-slate-400 text-[11px] ml-2 font-normal">${s.baseHourlyRate}/hr • ★ {s.averageRating}</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                APPROVED
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
