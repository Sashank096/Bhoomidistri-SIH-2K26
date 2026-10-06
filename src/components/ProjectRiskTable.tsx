import React, { useState } from 'react';
import { Eye, ChevronRight, Search, FolderPlus, Inbox } from 'lucide-react';

export interface ProjectSummaryRow {
  id: string;
  name: string;
  location: string;
  stage: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
  delayDays: number;
  totalParcels: number;
  acquiredParcels: number;
  budgetCr: number;
}

interface ProjectRiskTableProps {
  projects?: ProjectSummaryRow[];
  onSelectProject?: (project: ProjectSummaryRow) => void;
  onViewAllProjects?: () => void;
  onCreateProject?: () => void;
}

export const initialProjectData: ProjectSummaryRow[] = [];

export const ProjectRiskTable: React.FC<ProjectRiskTableProps> = ({
  projects = initialProjectData,
  onSelectProject,
  onViewAllProjects,
  onCreateProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (level: ProjectSummaryRow['riskLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[300px]">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              Project Risk Overview
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Summary of projects by risk level
            </p>
          </div>

          {/* Quick Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0B3520] w-32 sm:w-40"
              />
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs py-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0B3520] bg-white text-gray-700"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-2xs">
              <Inbox className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">No Projects Found</h4>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              No registered projects are present in the system database. Register a project or import cadastral data to begin risk analysis.
            </p>
            {onCreateProject && (
              <button
                type="button"
                onClick={onCreateProject}
                className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#0B3520] hover:bg-[#06452F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Register New Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <th className="py-2.5 px-2 font-semibold">Project ID</th>
                  <th className="py-2.5 px-2 font-semibold">Project Name</th>
                  <th className="py-2.5 px-2 font-semibold">Location</th>
                  <th className="py-2.5 px-2 font-semibold">Stage</th>
                  <th className="py-2.5 px-2 font-semibold">Risk Level</th>
                  <th className="py-2.5 px-2 font-semibold">Last Updated</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.slice(0, 5).map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectProject?.(project)}
                  >
                    <td className="py-3 px-2 font-mono font-bold text-[#0B3520]">
                      {project.id}
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900">
                      {project.name}
                    </td>
                    <td className="py-3 px-2 text-gray-600">{project.location}</td>
                    <td className="py-3 px-2 text-gray-600">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                        {project.stage}
                      </span>
                    </td>
                    <td className="py-3 px-2">{getRiskBadge(project.riskLevel)}</td>
                    <td className="py-3 px-2 text-gray-500 font-mono text-[11px]">
                      {project.lastUpdated}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject?.(project);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#0B3520] hover:bg-emerald-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Inspect Project Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filteredProjects.length > 0 ? 1 : 0} to {Math.min(5, filteredProjects.length)} of {projects.length} projects</span>
        <button
          type="button"
          onClick={onViewAllProjects}
          className="font-semibold text-[#0B3520] hover:underline flex items-center cursor-pointer"
        >
          <span>View All Projects</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
