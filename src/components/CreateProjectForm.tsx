import React, { useState } from 'react';
import {
  FolderPlus,
  MapPin,
  Calendar,
  Building,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Layers,
  Compass,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ProjectRecord, ProjectFormData, ProjectType } from '../types';
import {
  INDIAN_STATES_DISTRICTS,
  DEPARTMENTS_LIST,
  PROJECT_TYPES_LIST,
  OFFICERS_LIST,
} from '../data/projectsData';
import { GisLocationPickerModal } from './GisLocationPickerModal';

interface CreateProjectFormProps {
  existingProjectIds: string[];
  onCreateProject: (project: ProjectRecord, isDraft?: boolean) => void;
  onCancel: () => void;
  onOpenCreatedProject?: (project: ProjectRecord) => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  existingProjectIds,
  onCreateProject,
  onCancel,
  onOpenCreatedProject,
}) => {
  // Generate initial unique Project ID
  const generateNewId = () => {
    let id = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    while (existingProjectIds.includes(id)) {
      id = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return id;
  };

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    projectId: generateNewId(),
    projectType: 'Highway',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    location: '',
    department: 'National Highway Authority of India (NHAI)',
    startDate: '',
    targetCompletionDate: '',
    description: '',
    estimatedCostCr: '',
    totalLandAreaHa: '',
    numberOfVillages: '',
    initialAffectedFamilies: '',
    priority: 'High',
    assignedOfficer: 'Officer-102',
    gisCoordinates: { lat: 17.0005, lng: 82.2355, bbox: '16.90,82.15,17.15,82.35' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGisPickerOpen, setIsGisPickerOpen] = useState<boolean>(false);
  const [createdSuccessProject, setCreatedSuccessProject] = useState<ProjectRecord | null>(null);

  // Handle State Change -> Cascade Districts
  const handleStateChange = (newState: string) => {
    const districts = INDIAN_STATES_DISTRICTS[newState] || [];
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || '',
    }));
  };

  // Field Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Project name is required.';
    }

    if (!formData.projectId.trim()) {
      errs.projectId = 'Project ID is required.';
    } else if (existingProjectIds.includes(formData.projectId.trim())) {
      errs.projectId = 'This Project ID already exists. Please choose or generate a unique ID.';
    }

    if (!formData.projectType) {
      errs.projectType = 'Project type is required.';
    }

    if (!formData.state) {
      errs.state = 'State is required.';
    }

    if (!formData.district) {
      errs.district = 'District is required.';
    }

    if (!formData.location.trim()) {
      errs.location = 'Project location is required.';
    }

    if (!formData.department) {
      errs.department = 'Department / Authority is required.';
    }

    if (!formData.startDate) {
      errs.startDate = 'Start date is required.';
    }

    if (!formData.targetCompletionDate) {
      errs.targetCompletionDate = 'Target completion date is required.';
    } else if (formData.startDate && new Date(formData.targetCompletionDate) <= new Date(formData.startDate)) {
      errs.targetCompletionDate = 'Target Completion Date must be after Start Date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleCreate = (isDraft = false) => {
    if (!isDraft && !validate()) {
      // Scroll to first error if needed
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    const assignedOff = OFFICERS_LIST.find((o) => o.id === formData.assignedOfficer);

    const newProject: ProjectRecord = {
      id: formData.projectId.trim() || generateNewId(),
      name: formData.name.trim() || 'Untitled Project',
      projectType: formData.projectType,
      state: formData.state,
      district: formData.district,
      location: formData.location.trim() || `${formData.district}, ${formData.state}`,
      department: formData.department,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      targetCompletionDate: formData.targetCompletionDate || '2027-12-31',
      description: formData.description.trim(),
      status: isDraft ? 'Draft' : 'Planning',
      riskLevel: 'LOW',
      delayProbability: 15,
      delayDays: 0,
      totalParcels: parseInt(formData.numberOfVillages || '1', 10) * 45 || 250,
      acquiredParcels: 0,
      disputedParcels: 0,
      budgetCr: parseFloat(formData.estimatedCostCr) || 150.0,
      totalLandAreaHa: parseFloat(formData.totalLandAreaHa) || 85.0,
      numberOfVillages: parseInt(formData.numberOfVillages, 10) || 5,
      initialAffectedFamilies: parseInt(formData.initialAffectedFamilies, 10) || 120,
      priority: formData.priority,
      assignedOfficer: assignedOff ? `${assignedOff.id} (${assignedOff.name})` : formData.assignedOfficer,
      officerId: formData.assignedOfficer,
      createdBy: 'ADM-001 (Dr. Rajeshwar Sharma)',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      lastUpdated: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      stage: isDraft ? 'Draft Registration' : 'Planning',
      gisCoordinates: formData.gisCoordinates,
    };

    onCreateProject(newProject, isDraft);
    setCreatedSuccessProject(newProject);
  };

  // If successfully created, display Section 24 & 25 Success Screen & Workflow
  if (createdSuccessProject) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        {/* Success Banner Card */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-[#0B3520] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-700" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration Complete
            </span>
            <h2 className="text-2xl font-extrabold text-[#0B3520] pt-1">
              Project Created Successfully
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              The project has been registered in the BhoomiDrishti central repository and assigned an official lifecycle audit key.
            </p>
          </div>

          {/* Project Details Box */}
          <div className="bg-[#F8FAF9] rounded-xl border border-gray-200 p-4 max-w-lg mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">Project ID:</span>
              <span className="font-mono font-bold text-[#0B3520]">{createdSuccessProject.id}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">Project Name:</span>
              <span className="font-bold text-gray-900 text-right max-w-[280px]">{createdSuccessProject.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">Location &amp; State:</span>
              <span className="font-medium text-gray-800">{createdSuccessProject.district}, {createdSuccessProject.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Executing Department:</span>
              <span className="font-medium text-gray-800 text-right max-w-[260px] truncate">{createdSuccessProject.department}</span>
            </div>
          </div>

          {/* Workflow Diagram (Section 25) */}
          <div className="pt-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              BhoomiDrishti Next Lifecycle Workflow Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 max-w-3xl mx-auto">
              {[
                { label: 'Create Project', status: 'done' },
                { label: 'Project Created', status: 'done' },
                { label: 'Project Selection', status: 'active' },
                { label: 'Location / GIS', status: 'pending' },
                { label: 'Data Input', status: 'pending' },
                { label: 'Data Validation', status: 'pending' },
                { label: 'ML Prediction', status: 'pending' },
                { label: 'Risk Analysis', status: 'pending' },
              ].map((step, idx) => (
                <div
                  key={step.label}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    step.status === 'done'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : step.status === 'active'
                      ? 'bg-[#0B3520] text-white border-[#0B3520] font-bold shadow-xs'
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}
                >
                  <div className="text-[9px] font-mono uppercase">0{idx + 1}</div>
                  <div className="text-[10px] mt-0.5 leading-tight">{step.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-300 shadow-2xs transition-colors cursor-pointer"
            >
              Back to Projects List
            </button>
            <button
              type="button"
              onClick={() => onOpenCreatedProject?.(createdSuccessProject)}
              className="px-6 py-2.5 bg-[#0B3520] hover:bg-[#082818] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Open Project Workspace</span>
              <ArrowRight className="w-4 h-4 text-[#EAB308]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const districts = formData.state ? INDIAN_STATES_DISTRICTS[formData.state] || [] : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Form Header */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xl font-extrabold text-[#0B3520] tracking-tight">
          Create New Project
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Enter the basic information required to register a new land-acquisition project.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate(false);
        }}
        className="space-y-6"
      >
        {/* Section A — Project Identification */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#0B3520] font-mono font-bold text-xs flex items-center justify-center">
              A
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Project Identification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            {/* Project Name */}
            <div className="sm:col-span-8">
              <label className="block font-semibold text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter project name (e.g. NH-216 Coastal Highway Expansion)"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-medium ${
                  errors.name ? 'border-red-500 bg-red-50/40' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            {/* Project ID */}
            <div className="sm:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-gray-700">
                  Project ID <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, projectId: generateNewId() })}
                  className="text-[10px] text-[#0B3520] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  title="Generate random unique ID"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Auto
                </button>
              </div>
              <input
                type="text"
                placeholder="PRJ-XXXX"
                value={formData.projectId}
                onChange={(e) => {
                  setFormData({ ...formData, projectId: e.target.value });
                  if (errors.projectId) setErrors({ ...errors, projectId: '' });
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-mono font-bold text-[#0B3520] ${
                  errors.projectId ? 'border-red-500 bg-red-50/40' : 'border-gray-300'
                }`}
              />
              {errors.projectId && (
                <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.projectId}
                </p>
              )}
            </div>

            {/* Project Type */}
            <div className="sm:col-span-12">
              <label className="block font-semibold text-gray-700 mb-1">
                Project Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium text-gray-800"
              >
                {PROJECT_TYPES_LIST.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section B — Project Location */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#0B3520] font-mono font-bold text-xs flex items-center justify-center">
                B
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Project Location
              </h3>
            </div>

            {/* Section 17: GIS Location Option Button */}
            <button
              type="button"
              onClick={() => setIsGisPickerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0B3520] border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>📍 Select Location on Map</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* State */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium text-gray-800"
              >
                {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium text-gray-800"
              >
                {districts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Location text */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                Project Location / Alignment <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter village / mandal / locality / project area alignment"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-medium ${
                  errors.location ? 'border-red-500 bg-red-50/40' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section C — Department / Authority */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#0B3520] font-mono font-bold text-xs flex items-center justify-center">
              C
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Department / Authority
            </h3>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-gray-700 mb-1">
              Executing Department / Nodal Authority <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium text-gray-800"
            >
              {DEPARTMENTS_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section D — Project Timeline */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#0B3520] font-mono font-bold text-xs flex items-center justify-center">
              D
            </div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Project Timeline
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Start Date */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Start Date (DD/MM/YYYY) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  if (errors.startDate) setErrors({ ...errors, startDate: '' });
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-mono ${
                  errors.startDate ? 'border-red-500 bg-red-50/40' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.startDate}
                </p>
              )}
            </div>

            {/* Target Completion Date */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Target Completion Date (DD/MM/YYYY) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => {
                  setFormData({ ...formData, targetCompletionDate: e.target.value });
                  if (errors.targetCompletionDate) setErrors({ ...errors, targetCompletionDate: '' });
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-mono ${
                  errors.targetCompletionDate ? 'border-red-500 bg-red-50/40' : 'border-gray-300'
                }`}
              />
              {errors.targetCompletionDate && (
                <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.targetCompletionDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section E — Description */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#0B3520] font-mono font-bold text-xs flex items-center justify-center">
                E
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Project Description
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {formData.description.length} / 1000 characters
            </span>
          </div>

          <div className="text-xs">
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Provide a brief description of the project, its purpose, scope, and major objectives..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] text-gray-800"
            />
          </div>
        </div>

        {/* Section F — Optional Initial Metadata (Section 21) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-700 font-mono font-bold text-xs flex items-center justify-center">
                F
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Optional Initial Metadata
              </h3>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Preliminary Estimates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Estimated Cost (₹ Cr)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 420.5"
                value={formData.estimatedCostCr}
                onChange={(e) => setFormData({ ...formData, estimatedCostCr: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Total Land Area (Hectares)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 342.8"
                value={formData.totalLandAreaHa}
                onChange={(e) => setFormData({ ...formData, totalLandAreaHa: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Number of Villages
              </label>
              <input
                type="number"
                placeholder="e.g. 14"
                value={formData.numberOfVillages}
                onChange={(e) => setFormData({ ...formData, numberOfVillages: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Initial Affected Families
              </label>
              <input
                type="number"
                placeholder="e.g. 1240"
                value={formData.initialAffectedFamilies}
                onChange={(e) => setFormData({ ...formData, initialAffectedFamilies: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Project Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Assigned Officer
              </label>
              <select
                value={formData.assignedOfficer}
                onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                {OFFICERS_LIST.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons: Cancel, Save as Draft, Create Project (Section 23) */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-300"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleCreate(true)}
              className="px-5 py-2.5 text-xs font-semibold text-[#0B3520] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 shadow-2xs cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0B3520] hover:bg-[#082818] rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-[#EAB308]" />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      </form>

      {/* GIS Location Picker Modal */}
      <GisLocationPickerModal
        isOpen={isGisPickerOpen}
        onClose={() => setIsGisPickerOpen(false)}
        state={formData.state}
        district={formData.district}
        initialLocation={formData.location}
        onConfirmLocation={(locStr, coords) => {
          setFormData((prev) => ({
            ...prev,
            location: locStr,
            gisCoordinates: coords,
          }));
          if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
        }}
      />
    </div>
  );
};
