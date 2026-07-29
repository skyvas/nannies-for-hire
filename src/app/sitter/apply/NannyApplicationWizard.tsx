'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Trash2,
  ShieldCheck,
  Award,
  Sparkles,
  AlertCircle,
  User,
  Briefcase,
  FolderCheck,
  FileCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { brandConfig } from '../../../../brand.config';

export interface DocumentUploadItem {
  documentType:
    | 'GOVT_ID'
    | 'RESUME'
    | 'CPR_CERT'
    | 'FIRST_AID_CERT'
    | 'BACKGROUND_CHECK_AUTH'
    | 'DRIVERS_LICENSE'
    | 'AUTO_INSURANCE'
    | 'REFERENCES'
    | 'PROOF_OF_ADDRESS'
    | 'PROFESSIONAL_CERTS'
    | 'VACCINATION_RECORDS';
  label: string;
  required: boolean;
  file: File | null;
  fileName?: string;
  storagePath?: string;
  fileSize?: number;
  mimeType?: string;
}

const documentCategoryConfig: {
  type: DocumentUploadItem['documentType'];
  label: string;
  description: string;
  required: boolean;
}[] = [
  { type: 'GOVT_ID', label: 'Government-Issued ID', description: 'BC Services Card, Passport, or Driver License', required: true },
  { type: 'RESUME', label: 'Resume / CV', description: 'Detailed work history and experience with children', required: true },
  { type: 'CPR_CERT', label: 'CPR Certification', description: 'Red Cross or St. John Ambulance CPR C or BLS', required: true },
  { type: 'FIRST_AID_CERT', label: 'First Aid Certification', description: 'Standard Childcare First Aid certificate', required: true },
  { type: 'BACKGROUND_CHECK_AUTH', label: 'Background Check Consent', description: 'Signed criminal record & vulnerable sector consent form', required: true },
  { type: 'DRIVERS_LICENSE', label: 'Driver’s License', description: 'Valid Class 5 or 7 BC driver’s license (if applicable)', required: false },
  { type: 'AUTO_INSURANCE', label: 'Auto Insurance', description: 'Proof of valid ICBC vehicle insurance (if using own car)', required: false },
  { type: 'REFERENCES', label: 'Professional References', description: 'List of 2+ previous family references with phone numbers', required: true },
  { type: 'PROOF_OF_ADDRESS', label: 'Proof of Address', description: 'Utility bill, lease agreement, or bank statement (Metro Vancouver)', required: true },
  { type: 'PROFESSIONAL_CERTS', label: 'Professional Certifications', description: 'ECE, ECE Assistant, Special Needs, or Montessori diploma', required: false },
  { type: 'VACCINATION_RECORDS', label: 'Immunization Records', description: 'Up to date MMR & Tdap immunization proof', required: false },
];

export function NannyApplicationWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<{ applicationNumber: string; submittedAt: string } | null>(null);

  // Form State — Step 1: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(brandConfig.cities[0]?.name || 'Vancouver');
  const [state, setState] = useState('BC');
  const [postalCode, setPostalCode] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Form State — Step 2: Professional Information
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [childcareTypes, setChildcareTypes] = useState<string[]>(['Babysitting', 'Full-time Nanny']);
  const [infantExp, setInfantExp] = useState(true);
  const [toddlerExp, setToddlerExp] = useState(true);
  const [specialNeedsExp, setSpecialNeedsExp] = useState(false);
  const [languages, setLanguages] = useState('English');
  const [education, setEducation] = useState('Diploma / ECE Studies');
  const [certifications, setCertifications] = useState('Red Cross CPR-C, First Aid');
  const [availability, setAvailability] = useState('Evenings & Weekends');
  const [preferredSchedule, setPreferredSchedule] = useState('Mon-Fri 4pm-9pm, Sat-Sun All Day');
  const [willingToTravel, setWillingToTravel] = useState(true);
  const [driverLicenseStatus, setDriverLicenseStatus] = useState('Valid Class 5');
  const [ownVehicle, setOwnVehicle] = useState(true);
  const [cprCertified, setCprCertified] = useState(true);
  const [firstAidCertified, setFirstAidCertified] = useState(true);

  // Form State — Step 3: Documents Upload
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; storagePath: string; fileSize: number; mimeType: string }>>({
    GOVT_ID: { fileName: 'bc_services_card_id.pdf', storagePath: 'uploads/docs/govt_id_demo.pdf', fileSize: 245000, mimeType: 'application/pdf' },
    RESUME: { fileName: 'nanny_resume_2026.pdf', storagePath: 'uploads/docs/resume_demo.pdf', fileSize: 180000, mimeType: 'application/pdf' },
    CPR_CERT: { fileName: 'red_cross_cpr_cert.pdf', storagePath: 'uploads/docs/cpr_cert_demo.pdf', fileSize: 320000, mimeType: 'application/pdf' },
    FIRST_AID_CERT: { fileName: 'first_aid_childcare.pdf', storagePath: 'uploads/docs/first_aid_demo.pdf', fileSize: 310000, mimeType: 'application/pdf' },
    BACKGROUND_CHECK_AUTH: { fileName: 'vulnerable_sector_consent.pdf', storagePath: 'uploads/docs/consent_demo.pdf', fileSize: 150000, mimeType: 'application/pdf' },
    REFERENCES: { fileName: 'family_references_log.pdf', storagePath: 'uploads/docs/references_demo.pdf', fileSize: 110000, mimeType: 'application/pdf' },
    PROOF_OF_ADDRESS: { fileName: 'bc_hydro_bill.pdf', storagePath: 'uploads/docs/proof_address_demo.pdf', fileSize: 210000, mimeType: 'application/pdf' },
  });

  // Form State — Step 4: Agreements
  const [agreementsAccepted, setAgreementsAccepted] = useState(true);
  const [electronicSignature, setElectronicSignature] = useState('');

  // Handle Drag and Drop / File Input
  const handleFileUpload = (docType: DocumentUploadItem['documentType'], file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }

    setErrorMsg(null);
    const mockStoragePath = `uploads/docs/${docType.toLowerCase()}_${Date.now()}_${file.name}`;
    setUploadedDocs((prev) => ({
      ...prev,
      [docType]: {
        fileName: file.name,
        storagePath: mockStoragePath,
        fileSize: file.size,
        mimeType: file.type,
      },
    }));
  };

  const removeDocument = (docType: string) => {
    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[docType];
      return next;
    });
  };

  // Step Validation Handlers
  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) return 'First and Last Name are required.';
    if (!email.trim() || !email.includes('@')) return 'A valid email address is required.';
    if (!phone.trim() || phone.length < 7) return 'A valid mobile phone number is required.';
    if (!address.trim() || !city.trim() || !postalCode.trim()) return 'Complete street address and city are required.';
    if (!emergencyContact.trim() || !emergencyPhone.trim()) return 'Emergency contact information is required.';
    return null;
  };

  const validateStep2 = () => {
    if (yearsExperience < 0) return 'Years of experience must be 0 or greater.';
    if (!languages.trim()) return 'Languages spoken are required.';
    if (!education.trim()) return 'Education background is required.';
    if (!availability.trim()) return 'Availability details are required.';
    return null;
  };

  const validateStep3 = () => {
    const requiredTypes = documentCategoryConfig.filter((d) => d.required).map((d) => d.type);
    const missing = requiredTypes.filter((t) => !uploadedDocs[t]);
    if (missing.length > 0) {
      const missingLabels = documentCategoryConfig.filter((d) => missing.includes(d.type)).map((d) => d.label);
      return `Please upload all required documents: ${missingLabels.join(', ')}.`;
    }
    return null;
  };

  const validateStep4 = () => {
    if (!agreementsAccepted) return 'You must accept the terms and agreements.';
    if (!electronicSignature.trim()) return 'Electronic signature is required.';
    return null;
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    let err: string | null = null;
    if (currentStep === 1) err = validateStep1();
    if (currentStep === 2) err = validateStep2();
    if (currentStep === 3) err = validateStep3();
    if (currentStep === 4) err = validateStep4();

    if (err) {
      setErrorMsg(err);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitApplication = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const documentsPayload = Object.entries(uploadedDocs).map(([docType, meta]) => ({
        documentType: docType,
        fileName: meta.fileName,
        storagePath: meta.storagePath,
        fileSize: meta.fileSize,
        mimeType: meta.mimeType,
      }));

      const payload = {
        firstName,
        lastName,
        email,
        phone,
        dob,
        address,
        city,
        state,
        postalCode,
        emergencyContact,
        emergencyPhone,

        yearsExperience,
        childcareTypes,
        infantExp,
        toddlerExp,
        specialNeedsExp,
        languages,
        education,
        certifications,
        availability,
        preferredSchedule,
        willingToTravel,
        driverLicenseStatus,
        ownVehicle,
        cprCertified,
        firstAidCertified,

        agreementsAccepted,
        electronicSignature,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Browser',

        documents: documentsPayload,
      };

      const res = await fetch('/api/sitter/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedApp({
          applicationNumber: data.applicationNumber,
          submittedAt: new Date().toLocaleString(),
        });
      } else {
        setErrorMsg(data.error || (data.details ? data.details.join(', ') : 'Failed to submit application'));
      }
    } catch (err) {
      console.error('Application submit error:', err);
      setErrorMsg('An unexpected connection error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Confirmation Screen upon successful submission
  if (submittedApp) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Application Submitted
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to {brandConfig.name}!
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Your nanny application has been successfully logged and is currently in the verification queue.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-500 font-medium">Application Reference #</span>
            <span id="app-reference-number" data-testid="app-reference-number" className="font-extrabold text-blue-600 text-sm">
              {submittedApp.applicationNumber}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-500 font-medium">Applicant Name</span>
            <span className="font-bold text-slate-800 text-xs">
              {firstName} {lastName}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-500 font-medium">Status</span>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Submitted • Under Review
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Submission Date</span>
            <span className="text-xs font-medium text-slate-700">{submittedApp.submittedAt}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-800 text-left max-w-lg mx-auto flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">What Happens Next?</span>
            <p className="text-blue-700/90 leading-relaxed">
              Our Metro Vancouver admin team will inspect your uploaded ID, CPR certificates, and references. You will receive an email notification once your profile is approved!
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
          >
            Return to Home Page
          </Link>
          <Link
            href="/admin/vetting"
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            View in Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Progress Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Nanny Caregiver Application
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Complete all 5 guided steps to apply for approved sitter status in Metro Vancouver.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Step {currentStep} of 5
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Step Indicator Badges */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { step: 1, label: 'Personal', icon: User },
            { step: 2, label: 'Experience', icon: Briefcase },
            { step: 3, label: 'Documents', icon: FolderCheck },
            { step: 4, label: 'Agreements', icon: FileCheck },
            { step: 5, label: 'Review', icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;

            return (
              <div
                key={item.step}
                onClick={() => isDone && setCurrentStep(item.step)}
                className={`flex flex-col items-center gap-1.5 p-1 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : isDone
                    ? 'text-emerald-600 font-semibold hover:bg-slate-50'
                    : 'text-slate-400 opacity-60 pointer-events-none'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] hidden sm:inline">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div
          id="wizard-error-alert"
          data-testid="wizard-error-alert"
          className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Personal Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Step 1: Personal & Contact Information
            </h2>
            <p className="text-slate-500 text-xs">
              Provide your official name, contact info, and Metro Vancouver residential address.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                id="apply-first-name"
                data-testid="apply-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Chloe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                id="apply-last-name"
                data-testid="apply-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Tremblay"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                id="apply-email"
                data-testid="apply-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. chloe.t@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                id="apply-phone"
                data-testid="apply-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (604) 555-0199"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input
                id="apply-dob"
                data-testid="apply-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <select
                id="apply-city"
                data-testid="apply-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {brandConfig.cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
              <input
                id="apply-address"
                data-testid="apply-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 2450 W 4th Ave, Kitsilano"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code *</label>
              <input
                id="apply-postal-code"
                data-testid="apply-postal-code"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                placeholder="e.g. V6K 1P4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Name *</label>
              <input
                id="apply-emergency-contact"
                data-testid="apply-emergency-contact"
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Maria Tremblay (Mother)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone *</label>
              <input
                id="apply-emergency-phone"
                data-testid="apply-emergency-phone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="e.g. (604) 555-0122"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Professional Information */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Step 2: Professional Experience & Qualifications
            </h2>
            <p className="text-slate-500 text-xs">
              Highlight your years of experience, age group expertise, and certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Years of Childcare Experience *</label>
              <input
                id="apply-years-experience"
                data-testid="apply-years-experience"
                type="number"
                min="0"
                max="40"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken *</label>
              <input
                id="apply-languages"
                data-testid="apply-languages"
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, French, Mandarin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Education Background *</label>
              <input
                id="apply-education"
                data-testid="apply-education"
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. Bachelor of Education / ECE Certificate"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver’s License Status *</label>
              <select
                id="apply-driver-status"
                data-testid="apply-driver-status"
                value={driverLicenseStatus}
                onChange={(e) => setDriverLicenseStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="Valid Class 5">Valid Class 5 (Full License)</option>
                <option value="Valid Class 7">Valid Class 7 (N License)</option>
                <option value="No License">No License / Transit User</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">Age Group & Special Needs Experience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infantExp}
                    onChange={(e) => setInfantExp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Infant Experience (0-12m)</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toddlerExp}
                    onChange={(e) => setToddlerExp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Toddler Experience (1-3y)</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={specialNeedsExp}
                    onChange={(e) => setSpecialNeedsExp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Special Needs Experience</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">Certifications & Transport</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 cursor-pointer">
                  <input
                    id="apply-cpr-checkbox"
                    data-testid="apply-cpr-checkbox"
                    type="checkbox"
                    checked={cprCertified}
                    onChange={(e) => setCprCertified(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>CPR Certified</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstAidCertified}
                    onChange={(e) => setFirstAidCertified(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>First Aid Certified</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ownVehicle}
                    onChange={(e) => setOwnVehicle(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Own Personal Vehicle</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability Summary *</label>
              <input
                id="apply-availability"
                data-testid="apply-availability"
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. Available Mon-Fri evenings, Saturday all day"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Required Documents */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderCheck className="w-5 h-5 text-blue-600" />
              Step 3: Document Uploads & Verifications
            </h2>
            <p className="text-slate-500 text-xs">
              Upload copies of required credentials as specified in platform compliance rules (PDF, JPG, or PNG under 10MB).
            </p>
          </div>

          <div className="space-y-4">
            {documentCategoryConfig.map((item) => {
              const isUploaded = Boolean(uploadedDocs[item.type]);
              const docMeta = uploadedDocs[item.type];

              return (
                <div
                  key={item.type}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUploaded
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : item.required
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.label}</span>
                        {item.required ? (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            REQUIRED
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            OPTIONAL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUploaded ? (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
                            {docMeta.fileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(item.type)}
                            className="text-slate-400 hover:text-rose-600 ml-1 p-1"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(item.type, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Terms & Electronic Signature */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Step 4: Platform Terms & Electronic Signature
            </h2>
            <p className="text-slate-500 text-xs">
              Review and sign platform safety agreements and background check authorizations.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 max-h-40 overflow-y-auto leading-relaxed">
            <span className="font-bold text-slate-900 block">Metro Vancouver Caregiver Terms:</span>
            <p>
              1. I certify that all personal information and uploaded certificates provided in this application are authentic and accurate.
            </p>
            <p>
              2. I authorize {brandConfig.name} platform administration to verify my government ID, background check documents, and contact professional references.
            </p>
            <p>
              3. I agree to abide by the platform 15% commission fee schedule and strictly conduct all bookings through the platform messaging interface.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-200 cursor-pointer">
              <input
                id="apply-agree-checkbox"
                data-testid="apply-agree-checkbox"
                type="checkbox"
                checked={agreementsAccepted}
                onChange={(e) => setAgreementsAccepted(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 mt-0.5"
              />
              <span className="text-xs font-semibold text-slate-800">
                I accept the Terms of Service, Privacy Policy, and Criminal Background Check Authorization. *
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Electronic Signature (Type Full Legal Name) *
              </label>
              <input
                id="apply-signature"
                data-testid="apply-signature"
                type="text"
                value={electronicSignature}
                onChange={(e) => setElectronicSignature(e.target.value)}
                placeholder="e.g. Chloe Maria Tremblay"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                By typing your legal name above, you acknowledge this constitutes an official electronic signature.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Step 5: Review Application Summary
            </h2>
            <p className="text-slate-500 text-xs">
              Confirm your application details before submitting for admin vetting review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-900">Personal Info</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
              <p className="text-xs text-slate-700 font-medium">{firstName} {lastName}</p>
              <p className="text-xs text-slate-500">{email} • {phone}</p>
              <p className="text-xs text-slate-500">{address}, {city}, {postalCode}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-900">Experience</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
              <p className="text-xs text-slate-700 font-medium">{yearsExperience} Years Childcare Experience</p>
              <p className="text-xs text-slate-500">Education: {education}</p>
              <p className="text-xs text-slate-500">Languages: {languages}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-900">Uploaded Documents</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(uploadedDocs).map(([type, meta]) => (
                  <span key={type} className="bg-white border border-slate-200 text-xs text-slate-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    {meta.fileName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer Buttons */}
      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={isSubmitting}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {currentStep < 5 ? (
          <button
            id="wizard-next-btn"
            data-testid="wizard-next-btn"
            type="button"
            onClick={handleNextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 ml-auto"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="wizard-submit-btn"
            data-testid="wizard-submit-btn"
            type="button"
            onClick={handleSubmitApplication}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 ml-auto"
          >
            {isSubmitting ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Nanny Application
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
