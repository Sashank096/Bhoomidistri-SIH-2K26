import React from 'react';
import {
  FolderKanban,
  Briefcase,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface KpiSummaryCardsProps {
  projectsCount?: number;
  activeProjectsCount?: number;
  highRiskCount?: number;
  affectedFamiliesCount?: number;
  onSelectKpiFilter?: (type: 'total' | 'active' | 'high_risk' | 'families') => void;
  selectedKpi?: string;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  projectsCount = 0,
  activeProjectsCount = 0,
  highRiskCount = 0,
  affectedFamiliesCount = 0,
  onSelectKpiFilter,
  selectedKpi = 'total',
}) => {
  const kpiData = [
    {
      id: 'total' as const,
      title: 'Total Projects',
      value: projectsCount.toLocaleString(),
      footer: 'All registered projects',
      iconBg: 'bg-[#EAF5EE]',
      iconBorder: 'border-[#C8E7D4]',
      iconColor: 'text-[#0D5C3A]',
      icon: FolderKanban,
      sparklineColor: '#10B981',
      sparklinePath: 'M0,18 Q15,8 30,16 T60,12 T90,4 T120,10 T150,2 T180,12 L180,24 L0,24 Z',
      sparklineStroke: 'M0,18 Q15,8 30,16 T60,12 T90,4 T120,10 T150,2 T180,12',
    },
    {
      id: 'active' as const,
      title: 'Active Projects',
      value: activeProjectsCount.toLocaleString(),
      footer: 'Currently active projects',
      iconBg: 'bg-[#EBF5FF]',
      iconBorder: 'border-[#C3DDFD]',
      iconColor: 'text-[#1D4ED8]',
      icon: Briefcase,
      sparklineColor: '#3B82F6',
      sparklinePath: 'M0,20 Q20,15 40,22 T80,14 T120,8 T150,18 T180,10 L180,24 L0,24 Z',
      sparklineStroke: 'M0,20 Q20,15 40,22 T80,14 T120,8 T150,18 T180,10',
    },
    {
      id: 'high_risk' as const,
      title: 'High-Risk Projects',
      value: highRiskCount.toLocaleString(),
      footer: 'High + Critical risk',
      iconBg: 'bg-[#FFF4EB]',
      iconBorder: 'border-[#FED7AA]',
      iconColor: 'text-[#EA580C]',
      icon: AlertTriangle,
      sparklineColor: '#F97316',
      sparklinePath: 'M0,22 Q25,18 50,20 T100,10 T130,16 T160,8 T180,14 L180,24 L0,24 Z',
      sparklineStroke: 'M0,22 Q25,18 50,20 T100,10 T130,16 T160,8 T180,14',
    },
    {
      id: 'families' as const,
      title: 'Total Affected Families',
      value: affectedFamiliesCount.toLocaleString(),
      footer: 'Across all projects',
      iconBg: 'bg-[#F3E8FF]',
      iconBorder: 'border-[#DDD6FE]',
      iconColor: 'text-[#7E22CE]',
      icon: Users,
      sparklineColor: '#8B5CF6',
      sparklinePath: 'M0,20 Q20,14 40,18 T80,8 T120,16 T150,6 T180,12 L180,24 L0,24 Z',
      sparklineStroke: 'M0,20 Q20,14 40,18 T80,8 T120,16 T150,6 T180,12',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = selectedKpi === kpi.id;

        return (
          <div
            key={kpi.id}
            onClick={() => onSelectKpiFilter?.(kpi.id)}
            className={`bg-white rounded-2xl p-5 border transition-all duration-150 cursor-pointer shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-md ${
              isSelected
                ? 'border-[#0B3520] ring-1 ring-[#0B3520]'
                : 'border-gray-200/80 hover:border-gray-300'
            }`}
          >
            {/* Top row: Icon + Title & Value */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl ${kpi.iconBg} border ${kpi.iconBorder} ${kpi.iconColor} flex items-center justify-center flex-shrink-0 shadow-xs`}
              >
                <Icon className="w-6 h-6 stroke-[1.8]" />
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 block leading-tight">
                  {kpi.title}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-0.5 tracking-tight font-sans">
                  {kpi.value}
                </div>
              </div>
            </div>

            {/* Bottom row: Sub-label + Sparkline Chart */}
            <div className="mt-4 pt-2 flex items-end justify-between gap-2 border-t border-gray-100/80">
              <span className="text-[11px] text-gray-500 font-medium">
                {kpi.footer}
              </span>

              <div className="w-24 h-6 flex-shrink-0">
                <svg
                  viewBox="0 0 180 24"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <path
                    d={kpi.sparklinePath}
                    fill={kpi.sparklineColor}
                    fillOpacity="0.12"
                  />
                  <path
                    d={kpi.sparklineStroke}
                    fill="none"
                    stroke={kpi.sparklineColor}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
