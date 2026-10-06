import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, CheckCircle2, AlertCircle, Calendar, Building, UserCheck } from 'lucide-react';
import { ProjectRecord } from '../types';
import { INDIAN_STATES_DISTRICTS, DEPARTMENTS_LIST, OFFICERS_LIST, PROJECT_TYPES_LIST } from '../data/projectsData';

interface EditProjectModalProps {
  project: ProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: ProjectRecord) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ProjectRecord>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
      });
      setErrors({});
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleStateChange = (newState: string) => {
    const districts = INDIAN_STATES_DISTRICTS[newState] || [];
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || '',
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) errs.name = 'Project name is required.';
    if (!formData.startDate) errs.startDate = 'Start date is required.';
    if (!formData.targetCompletionDate) errs.targetCompletionDate = 'Target completion date is required.';
    if (
      formData.startDate &&
      formData.targetCompletionDate &&
      new Date(formData.targetCompletionDate) <= new Date(formData.startDate)
    ) {
      errs.targetCompletionDate = 'Target Completion Date must be after Start Date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updated: ProjectRecord = {
      ...project,
      ...(formData as ProjectRecord),
      lastUpdated: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    onSave(updated);
    onClose();
  };

  const districts = formData.state ? INDIAN_STATES_DISTRICTS[formData.state] || [] : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B3520] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#EAB308] font-bold">
                  {project.id}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/80">Authorized Project Edit</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-md">
                Edit Project: {project.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Project Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-medium ${
                errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Project Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Project Type
              </label>
              <select
                value={formData.projectType || 'Highway'}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                {PROJECT_TYPES_LIST.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Project Status
              </label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="Under Review">Under Review</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* State & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                State
              </label>
              <select
                value={formData.state || ''}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                District
              </label>
              <select
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                {districts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location / Locality */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Project Location / Alignment
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-medium"
            />
          </div>

          {/* Department & Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Department / Authority
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                {DEPARTMENTS_LIST.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Assigned Officer
              </label>
              <select
                value={formData.officerId || 'Officer-102'}
                onChange={(e) => {
                  const off = OFFICERS_LIST.find((o) => o.id === e.target.value);
                  setFormData({
                    ...formData,
                    officerId: e.target.value,
                    assignedOfficer: off ? `${off.id} (${off.name})` : e.target.value,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium"
              >
                {OFFICERS_LIST.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Target Completion Date *
              </label>
              <input
                type="date"
                value={formData.targetCompletionDate || ''}
                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-mono ${
                  errors.targetCompletionDate ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              />
              {errors.targetCompletionDate && (
                <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.targetCompletionDate}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-[#0B3520] hover:bg-[#082818] rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#EAB308]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
