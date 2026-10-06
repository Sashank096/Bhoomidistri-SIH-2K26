import React, { useState } from 'react';
import { X, Plus, FolderPlus, MapPin, Building, Calendar, Layers } from 'lucide-react';
import { ProjectSummaryRow } from './ProjectRiskTable';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: ProjectSummaryRow) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Maharashtra');
  const [stage, setStage] = useState('Planning');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [parcels, setParcels] = useState('650');
  const [budget, setBudget] = useState('320.0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: ProjectSummaryRow = {
      id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      location,
      stage,
      riskLevel,
      lastUpdated: '28 Aug 2026',
      delayDays: riskLevel === 'CRITICAL' ? 120 : riskLevel === 'HIGH' ? 65 : 15,
      totalParcels: parseInt(parcels, 10) || 500,
      acquiredParcels: 0,
      budgetCr: parseFloat(budget) || 100,
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-[#0B3520] text-white p-5 flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Register New Land Acquisition Project
              </h3>
              <p className="text-xs text-white/70">
                Department of Land Resources (DoLR) Master Portfolio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Project Title / Infrastructure Alignment *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Surat-Chennai Expressway Corridor Package-III"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                State / Jurisdiction
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white"
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Odisha">Odisha</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Initial Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white"
              >
                <option value="Planning">Planning</option>
                <option value="Land Survey">Land Survey</option>
                <option value="Documentation">Documentation</option>
                <option value="Award Inquiry">Award Inquiry</option>
                <option value="Compensation">Compensation</option>
                <option value="R&R">R&amp;R</option>
                <option value="Possession">Possession</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Initial Risk
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Total Parcels
              </label>
              <input
                type="number"
                value={parcels}
                onChange={(e) => setParcels(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Budget (₹ Cr)
              </label>
              <input
                type="number"
                step="0.1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-[11px]">
            New projects automatically synchronize with Bhuvan Satellite GIS &amp; State Revenue Records (RoR).
          </div>

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
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
