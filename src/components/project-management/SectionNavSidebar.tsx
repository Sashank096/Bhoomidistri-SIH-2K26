import React from 'react';
import {
  MapPin,
  Users,
  IndianRupee,
  FileCheck,
  Scale,
  FileText,
  Home,
  ShieldAlert,
  Handshake,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { DataSectionId, SectionCompletionStatus } from '../../types';

export interface SectionNavItem {
  id: DataSectionId;
  code: string;
  title: string;
  icon: React.ElementType;
  status: SectionCompletionStatus;
  recordCount: number;
}

interface SectionNavSidebarProps {
  activeSection: DataSectionId;
  onSelectSection: (section: DataSectionId) => void;
  sectionStatuses: Record<DataSectionId, { status: SectionCompletionStatus; count: number }>;
}

export const SectionNavSidebar: React.FC<SectionNavSidebarProps> = ({
  activeSection,
  onSelectSection,
  sectionStatuses,
}) => {
  const sections: { id: DataSectionId; code: string; title: string; icon: React.ElementType }[] = [
    { id: 'land', code: '01', title: 'Land Details', icon: MapPin },
    { id: 'families', code: '02', title: 'Affected Families', icon: Users },
    { id: 'compensation', code: '03', title: 'Compensation', icon: IndianRupee },
    { id: 'approvals', code: '04', title: 'Approvals', icon: FileCheck },
    { id: 'legal', code: '05', title: 'Legal Disputes', icon: Scale },
    { id: 'documents', code: '06', title: 'Documents', icon: FileText },
    { id: 'rr', code: '07', title: 'R&R', icon: Home },
    { id: 'possession', code: '08', title: 'Possession', icon: ShieldAlert },
    { id: 'stakeholders', code: '09', title: 'Stakeholders', icon: Handshake },
  ];

  const renderStatusBadge = (status: SectionCompletionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center text-emerald-600" title="Completed">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        );
      case 'in_progress':
        return (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" title="In Progress" />
        );
      case 'requires_attention':
        return (
          <span className="flex items-center text-red-500" title="Requires Attention">
            <AlertTriangle className="w-3.5 h-3.5" />
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="w-2.5 h-2.5 rounded-full border border-gray-400 bg-transparent" title="Not Started" />
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
          <span>Data Categories</span>
          <span className="text-[11px] font-normal text-gray-500">9 Modules</span>
        </h2>
      </div>

      <div className="p-2 space-y-1">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          const statusInfo = sectionStatuses[sec.id] || { status: 'not_started', count: 0 };

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs font-medium cursor-pointer ${
                isActive
                  ? 'bg-[#0B3520] text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`font-mono text-[11px] font-bold ${
                    isActive ? 'text-[#EAB308]' : 'text-gray-400'
                  }`}
                >
                  {sec.code}
                </span>

                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                />

                <span className="truncate">{sec.title}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {statusInfo.count}
                </span>

                <div className={isActive ? 'text-white' : ''}>
                  {renderStatusBadge(statusInfo.status)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
