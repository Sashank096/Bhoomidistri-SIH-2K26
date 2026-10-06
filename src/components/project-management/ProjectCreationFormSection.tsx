import React, { useState } from 'react';
import {
  FolderPlus,
  MapPin,
  Building,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Save,
  X,
} from 'lucide-react';
import { ProjectRecord, ProjectFormData, ProjectType } from '../../types';
import {
  INDIAN_STATES_DISTRICTS,
  DEPARTMENTS_LIST,
  PROJECT_TYPES_LIST,
  OFFICERS_LIST,
} from '../../data/projectsData';

interface ProjectCreationFormSectionProps {
  existingProjectIds: string[];
  onCreateProject: (project: ProjectRecord, isDraft?: boolean) => void;
  onCancel: () => void;
}

export const ProjectCreationFormSection: React.FC<ProjectCreationFormSectionProps> = ({
  existingProjectIds,
  onCreateProject,
  onCancel,
}) => {
  const generateNewId = () => {
    let id = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    while (existingProjectIds.includes(id)) {
      id = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return id;
  };

  const [activeFormTab, setActiveFormTab] = useState<'identification' | 'location' | 'department' | 'timeline' | 'description'>('identification');

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    projectId: generateNewId(),
    projectType: 'Highway',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    location: '',
    department: 'National Highway Authority of India (NHAI)',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '2028-12-31',
    description: '',
    estimatedCostCr: '450.0',
    totalLandAreaHa: '84.5',
    numberOfVillages: '6',
    initialAffectedFamilies: '142',
    priority: 'High',
    assignedOfficer: 'Officer 102 (Dr. Rajeshwar Sharma)',
    gisCoordinates: {
      lat: 16.9891,
      lng: 82.2475,
      bbox: '16.95,82.20,17.02,82.30',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDistricts = INDIAN_STATES_DISTRICTS[formData.state] || [
    'District Central',
    'District North',
    'District South',
  ];

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    const firstDistrict = (INDIAN_STATES_DISTRICTS[newState] && INDIAN_STATES_DISTRICTS[newState][0]) || 'District 1';
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: firstDistrict,
    }));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Project Name is mandatory';
    if (!formData.projectId.trim()) errs.projectId = 'Project ID is required';
    if (!formData.location.trim()) errs.location = 'Specific Location / Corridor Alignment is required';
    if (!formData.startDate) errs.startDate = 'Start date is required';
    if (!formData.targetCompletionDate) errs.targetCompletionDate = 'Target completion date is required';
    if (new Date(formData.targetCompletionDate) <= new Date(formData.startDate)) {
      errs.targetCompletionDate = 'Target completion date must be after Start Date';
    }
    if (!formData.description.trim()) errs.description = 'Project Description and Public Purpose is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      // Find the first tab with an error
      if (errors.name || errors.projectId) setActiveFormTab('identification');
      else if (errors.location) setActiveFormTab('location');
      else if (errors.startDate || errors.targetCompletionDate) setActiveFormTab('timeline');
      else if (errors.description) setActiveFormTab('description');
      return;
    }

    setIsSubmitting(true);

    const officerObj = OFFICERS_LIST.find((o) => o.name === formData.assignedOfficer) || OFFICERS_LIST[0];

    const newProject: ProjectRecord = {
      id: formData.projectId.trim().toUpperCase(),
      name: formData.name.trim() || 'Untitled Land Acquisition Project',
      projectType: formData.projectType,
      state: formData.state,
      district: formData.district,
      location: formData.location.trim() || `${formData.district}, ${formData.state}`,
      department: formData.department,
      startDate: formData.startDate,
      targetCompletionDate: formData.targetCompletionDate,
      description: formData.description.trim(),
      status: isDraft ? 'Draft' : 'Active',
      riskLevel: 'MEDIUM',
      delayProbability: 24,
      delayDays: 15,
      totalParcels: Math.round((parseFloat(formData.totalLandAreaHa) || 50) * 8),
      acquiredParcels: 0,
      disputedParcels: 0,
      budgetCr: parseFloat(formData.estimatedCostCr) || 100,
      totalLandAreaHa: parseFloat(formData.totalLandAreaHa) || 50,
      numberOfVillages: parseInt(formData.numberOfVillages, 10) || 4,
      initialAffectedFamilies: parseInt(formData.initialAffectedFamilies, 10) || 50,
      priority: formData.priority,
      assignedOfficer: officerObj.name,
      officerId: officerObj.id,
      createdBy: 'NIC Land Records Portal Admin',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: 'Just now',
      archivedAt: null,
      stage: 'Planning & Survey',
      gisCoordinates: formData.gisCoordinates,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onCreateProject(newProject, isDraft);
    }, 400);
  };

  const tabs: { id: typeof activeFormTab; label: string; icon: React.ElementType }[] = [
    { id: 'identification', label: '1. Identification', icon: FolderPlus },
    { id: 'location', label: '2. Location & GIS', icon: MapPin },
    { id: 'department', label: '3. Department & Officer', icon: Building },
    { id: 'timeline', label: '4. Timeline & Budget', icon: Calendar },
    { id: 'description', label: '5. Description & Scope', icon: FileText },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#0B3520] text-white p-6 border-b border-[#EAB308] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Register New Land Acquisition Project</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EAB308] text-gray-900 font-bold">
                BHOOMI-FORM-01
              </span>
            </h2>
            <p className="text-xs text-white/70">
              Department of Land Resources (DoLR) • Complete all 5 sections for initial validation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 5-Step Tab Navigator */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeFormTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveFormTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0B3520] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Area */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Section 1: Project Identification */}
        {activeFormTab === 'identification' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#0B3520]" />
                <span>Section 1: Project Identification</span>
              </h3>
              <p className="text-xs text-gray-500">Specify the official project title, unique ID, and statutory type.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Official Project Title / Gazette Name <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-normal text-gray-400">e.g. NH-216 Land Acquisition</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full statutory project name..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3520] ${
                    errors.name ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-600 font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Unique Project ID <span className="text-red-500">*</span></span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, projectId: generateNewId() })}
                    className="text-[11px] text-[#0B3520] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </label>
                <input
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 font-mono text-xs font-bold text-gray-800 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Project Type / Sector <span className="text-red-500">*</span></label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-800"
                >
                  {PROJECT_TYPES_LIST.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['High', 'Medium', 'Standard'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.priority === p
                          ? 'bg-[#0B3520] text-white border-[#0B3520]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Estimated Total Outlay (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.estimatedCostCr}
                  onChange={(e) => setFormData({ ...formData, estimatedCostCr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                  placeholder="e.g. 450.0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Location & GIS */}
        {activeFormTab === 'location' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B3520]" />
                <span>Section 2: Location &amp; Spatial Alignment</span>
              </h3>
              <p className="text-xs text-gray-500">Define jurisdiction, affected villages, and land area dimensions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">State / Union Territory <span className="text-red-500">*</span></label>
                <select
                  value={formData.state}
                  onChange={handleStateChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-800"
                >
                  {Object.keys(INDIAN_STATES_DISTRICTS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Revenue District <span className="text-red-500">*</span></label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-800"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Specific Alignment / Village Reach / Chainage <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-gray-400">e.g. Kathipudi to Kakinada Bypass (Km 12+000 to 36+500)</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter detailed route corridor and landmark villages..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3520] ${
                    errors.location ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.location && <p className="text-[11px] text-red-600 font-medium">{errors.location}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Total Land Area Required (Hectares)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalLandAreaHa}
                  onChange={(e) => setFormData({ ...formData, totalLandAreaHa: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono"
                  placeholder="e.g. 84.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Estimated Affected Revenue Villages</label>
                <input
                  type="number"
                  value={formData.numberOfVillages}
                  onChange={(e) => setFormData({ ...formData, numberOfVillages: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono"
                  placeholder="e.g. 6"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Department & Officer */}
        {activeFormTab === 'department' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0B3520]" />
                <span>Section 3: Department &amp; Administrative Assignment</span>
              </h3>
              <p className="text-xs text-gray-500">Designate the acquiring body and the responsible Land Acquisition Officer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Nodal Acquiring Department / Agency <span className="text-red-500">*</span></label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-800"
                >
                  {DEPARTMENTS_LIST.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Designated Competent Authority (CALA / LAO) <span className="text-red-500">*</span></label>
                <select
                  value={formData.assignedOfficer}
                  onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-800"
                >
                  {OFFICERS_LIST.map((off) => (
                    <option key={off.id} value={off.name}>
                      {off.name} — {off.designation} ({off.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Timeline */}
        {activeFormTab === 'timeline' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0B3520]" />
                <span>Section 4: Project Timeline &amp; Milestone Schedule</span>
              </h3>
              <p className="text-xs text-gray-500">Record baseline statutory timelines to monitor potential delay triggers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Project Sanction / Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Target Completion Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.targetCompletionDate}
                  onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                    errors.targetCompletionDate ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.targetCompletionDate && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.targetCompletionDate}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Baseline Families Identified for Initial SIA</label>
                <input
                  type="number"
                  value={formData.initialAffectedFamilies}
                  onChange={(e) => setFormData({ ...formData, initialAffectedFamilies: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono"
                  placeholder="e.g. 142"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Description & Public Purpose */}
        {activeFormTab === 'description' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B3520]" />
                <span>Section 5: Project Description &amp; Public Purpose</span>
              </h3>
              <p className="text-xs text-gray-500">Provide the strategic public purpose justification and statutory notes.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Public Purpose Description &amp; Objectives <span className="text-red-500">*</span></span>
                <span className="text-[11px] text-gray-400">Under RFCTLARR Act 2013 / Relevant State Act</span>
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe project necessity, public infrastructure impact, environmental sensitivity, and rehabilitation scope..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3520] ${
                  errors.description ? 'border-red-500 bg-red-50/20' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.description && <p className="text-[11px] text-red-600 font-medium">{errors.description}</p>}
            </div>
          </div>
        )}

        {/* Bottom Form Navigation & Submission Actions */}
        <div className="pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeFormTab !== 'description' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeFormTab === 'identification') setActiveFormTab('location');
                  else if (activeFormTab === 'location') setActiveFormTab('department');
                  else if (activeFormTab === 'department') setActiveFormTab('timeline');
                  else if (activeFormTab === 'timeline') setActiveFormTab('description');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Next Section</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-900 bg-[#EAB308] hover:bg-[#EAB308]/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 text-gray-900" />
                <span>{isSubmitting ? 'Registering Project...' : 'Register Project Portfolio'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
