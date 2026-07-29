import React from 'react';
import Link from 'next/link';
import { brandConfig } from '../../../brand.config';
import { HeartHandshake, ShieldCheck, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span>{brandConfig.name}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {brandConfig.tagline}
            </p>
            <div className="flex items-center gap-1.5 text-slate-300 text-xs pt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Metro Vancouver, BC, Canada</span>
            </div>
          </div>

          {/* Column 2: Metro Vancouver Cities */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Metro Vancouver Service Areas
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              {brandConfig.cities.map((city) => (
                <li key={city.name} className="hover:text-white transition-colors">
                  {city.name} ({city.neighborhoods.slice(0, 3).join(', ')})
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Trust & Safety
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Manual ID Document Vetting
              </li>
              <li>CPR & First Aid Verification</li>
              <li>15% Protected Marketplace Payments</li>
              <li>PIPEDA Canadian Privacy Compliant</li>
            </ul>
          </div>

          {/* Column 4: Contact & Platform */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Support & Rebranding Engine
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Single-Tenant White-Label Core Engine. Configured via <code className="text-blue-400">brand.config.ts</code>.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <a href={`mailto:${brandConfig.supportEmail}`} className="hover:underline">
                {brandConfig.supportEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {brandConfig.name}. All rights reserved.</p>
          <p className="text-slate-400">Operating in British Columbia, Canada (CAD)</p>
        </div>

      </div>
    </footer>
  );
}
