import React, { useState } from 'react';
import {
  AlertTriangle,
  Scale,
  Building2,
  TreePine,
  Users2,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
  ShieldAlert,
  BrainCircuit,
  Settings,
  Database,
  Users,
  ScrollText,
  FileCheck,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { INITIAL_PROJECTS } from '../data/projectsData';
import { AuditEntry, readAuditEntries, recordAudit } from '../services/auditLogGateway';

export const RiskAnalysisView: React.FC = () => {
  const riskCategories = [
    {
      title: 'Litigation & Court Injunctions',
      score: 84,
      level: 'High Risk',
      color: 'text-red-600',
      barColor: 'bg-red-500',
      icon: Scale,
      summary: '14 active writ petitions under Section 64 reference in High Court. Average resolution lead-time: 140 days.',
    },
    {
      title: 'Land Mutation & Title Discrepancies',
      score: 62,
      level: 'Moderate',
      color: 'text-amber-600',
      barColor: 'bg-amber-500',
      icon: Building2,
      summary: '38 joint khata properties pending digital succession certification at Tehsil offices.',
    },
    {
      title: 'Forest & Environmental Buffer Clearances',
      score: 41,
      level: 'Low-Medium',
      color: 'text-yellow-600',
      barColor: 'bg-yellow-500',
      icon: TreePine,
      summary: 'Stage-II FCA in-principle approval granted for 8.4 Ha corridor.',
    },
    {
      title: 'R&R / Gram Sabha Consensus Alignment',
      score: 76,
      level: 'High Risk',
      color: 'text-red-600',
      barColor: 'bg-red-500',
      icon: Users2,
      summary: 'Rehabilitation package award valuation disputes across 2 village clusters.',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          AI Risk Analysis &amp; Delay Root Causes
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Predictive vulnerability index across legal, title, environmental, and socio-economic dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      {cat.title}
                    </h3>
                    <span className={`text-xs font-semibold ${cat.color}`}>
                      {cat.level} (Vulnerability Index: {cat.score}/100)
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.barColor} rounded-full`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-[#F9FBFA] p-3 rounded-xl border border-gray-100">
                {cat.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PredictionsView: React.FC = () => {
  const [compensationPace, setCompensationPace] = useState(65);
  const [disputeFastTrack, setDisputeFastTrack] = useState(true);

  // Simulated calculation
  const predictedDelay = Math.max(
    12,
    Math.round(140 - compensationPace * 0.9 - (disputeFastTrack ? 35 : 0))
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Machine Learning Delay Forecaster &amp; Scenario Simulator
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Simulate intervention policies to proactively compress land acquisition completion schedules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Policy Variable Simulation</h3>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Direct Benefit Transfer (DBT) Disbursement Pace:</span>
              <span className="font-bold font-mono text-[#0B3520]">{compensationPace}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={compensationPace}
              onChange={(e) => setCompensationPace(Number(e.target.value))}
              className="w-full accent-[#0B3520]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-900">
                Dedicated Revenue Court Tribunal Special Bench
              </div>
              <div className="text-[11px] text-gray-500">
                Accelerates Section 64 land reference disputes
              </div>
            </div>
            <input
              type="checkbox"
              checked={disputeFastTrack}
              onChange={(e) => setDisputeFastTrack(e.target.checked)}
              className="w-4 h-4 accent-[#0B3520]"
            />
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-800 font-medium">
              Target Completion Horizon:
            </span>
            <div className="text-2xl font-black text-[#0B3520] mt-1 font-mono">
              +{predictedDelay} Days Expected Delay
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              {predictedDelay < 45
                ? 'On track for scheduled construction notice (Possession Stage-I).'
                : 'Warning: Critical path milestone exceeded. Intervention recommended.'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Model Telemetry &amp; Grounding
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              BhoomiDrishti neural models analyze historical acquisition lifecycles across 4,200+ Indian infrastructure projects, cross-referencing ISRO Bhuvan satellite imagery with State e-Bhoomi databases.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Model Version:</span>
              <span className="font-mono font-bold">Bhoomi-XGBoost-v4.2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Prediction Accuracy (R²):</span>
              <span className="font-mono font-bold text-emerald-700">0.934</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Weight Recalibration:</span>
              <span className="font-mono text-gray-700">28-Aug-2026 04:00 IST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReportsView: React.FC = () => {
  const [reportMonth, setReportMonth] = useState('2026-08');
  const formattedMonth = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(`${reportMonth}-01T00:00:00`));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Statutory Compliance &amp; Analytical Reports
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Generate DoLR, Ministry of Rural Development, and CAG audit-ready dossiers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'LA Report',
            period: formattedMonth,
            format: 'PDF / Excel',
            badge: 'Mandatory',
          },
          {
            title: 'Payment Ledger',
            period: 'Q2 FY 2026-27',
            format: 'PFMS Sync PDF',
            badge: 'Verified',
          },
          {
            title: 'Risk Audit',
            period: 'Corridor Level',
            format: 'Executive Dossier',
            badge: 'AI Generated',
          },
        ].map((rep, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0B3520] border border-emerald-200 inline-block mb-2">
                {rep.badge}
              </span>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                {rep.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Period: {rep.period}</p>
            </div>

            <button
              type="button"
              className="mt-4 w-full py-2 bg-[#0B3520] hover:bg-[#082818] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Generate {rep.format}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#0B3520] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Reporting month</h3>
          <p className="text-xs text-gray-500 mt-1">Choose the month used for the LA Report and future report exports.</p>
        </div>
        <label className="flex items-center gap-3 text-xs font-semibold text-gray-700">
          <span>Month</span>
          <input
            type="month"
            value={reportMonth}
            onChange={(event) => setReportMonth(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold text-[#0B3520] focus:border-[#0B3520] focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
};

export const AdministrationView: React.FC<{ tab: string }> = ({ tab }) => {
  if (tab === 'users') return <OfficerManagementView />;
  if (tab === 'audit_logs') return <AuditLogsView />;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          Administration: {tab.replace('_', ' ')}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          NIC Centralized Security &amp; Infrastructure Governance Console
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#0B3520]">
          <CheckCircle2 className="w-4 h-4" />
          <span>Operational Node Status: Active (NIC MeghRaj Cloud Tier-4)</span>
        </div>
        <p className="text-gray-600">
          All administrative operations, role privileges, and dataset sync sessions are cryptographically signed and logged for CAG audit compliance.
        </p>
      </div>
    </div>
  );
};

interface ManagedOfficer { id: string; name: string; designation: string; projectId: string; }

const OfficerManagementView: React.FC = () => {
  const [officers, setOfficers] = useState<ManagedOfficer[]>([
    { id: 'Officer-102', name: 'Dr. Rajeshwar Sharma, IAS', designation: 'Central Nodal Officer', projectId: INITIAL_PROJECTS[0]?.id || '' },
    { id: 'Officer-108', name: 'Shri A. K. Verma, IDAS', designation: 'Director (Land Records)', projectId: '' },
  ]);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Special Land Acquisition Officer');
  const [notice, setNotice] = useState('');

  const createOfficer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setNotice('Enter the officer name before creating the account.'); return; }
    const id = `Officer-${102 + officers.length * 7}`;
    setOfficers((current) => [...current, { id, name: name.trim(), designation, projectId: '' }]);
    recordAudit({ actor: 'Current Administrator', action: 'OFFICER_CREATED', entity: 'Officer', entityId: id, result: 'SUCCESS', details: `${name.trim()} created with designation ${designation}.` });
    setName(''); setNotice(`${id} created. Assign a project from the officer table.`);
  };

  const assignProject = (officerId: string, projectId: string) => {
    setOfficers((current) => current.map((officer) => officer.id === officerId ? { ...officer, projectId } : officer));
    const project = INITIAL_PROJECTS.find((item) => item.id === projectId);
    recordAudit({ actor: 'Current Administrator', action: projectId ? 'PROJECT_ASSIGNED' : 'PROJECT_UNASSIGNED', entity: 'Project Assignment', entityId: projectId || officerId, result: 'SUCCESS', details: project ? `${officerId} assigned to ${project.name} (${projectId}).` : `${officerId} project assignment cleared.` });
    setNotice(project ? `${officerId} assigned to ${project.name}.` : `${officerId} assignment cleared.`);
  };

  return <div className="space-y-5"><div><h2 className="text-xl font-bold text-gray-900">Officer Management &amp; Project Assignment</h2><p className="text-xs text-gray-500 mt-0.5">Create designated Officer accounts and assign their land-acquisition workload from one controlled workspace.</p></div>{notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{notice}</div>}<form onSubmit={createOfficer} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs"><div className="flex items-center gap-2 text-sm font-bold text-[#0B3520] mb-4"><UserPlus className="w-4 h-4" /> Create officer account</div><div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end"><label className="text-xs font-semibold text-gray-700">Officer name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Smt. Priya Sundaram, IAS" className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal focus:border-[#0B3520] focus:outline-none" /></label><label className="text-xs font-semibold text-gray-700">Designation<input value={designation} onChange={(event) => setDesignation(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal focus:border-[#0B3520] focus:outline-none" /></label><button type="submit" className="rounded-xl bg-[#0B3520] text-white px-5 py-2.5 text-xs font-bold">Create officer</button></div><p className="text-[11px] text-gray-400 mt-3">Account creation is recorded in the local prototype workspace. Production credentials should be provisioned by the identity service.</p></form><div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden"><div className="p-5 border-b border-gray-100 flex items-center justify-between"><div><h3 className="text-sm font-bold text-gray-900">Officer assignments</h3><p className="text-xs text-gray-500 mt-1">Each officer can be assigned a specific project.</p></div><span className="text-xs font-bold text-[#0B3520] bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">{officers.length} officers</span></div><div className="divide-y divide-gray-100">{officers.map((officer) => <div key={officer.id} className="p-4 grid md:grid-cols-[1fr_1fr_260px] gap-3 items-center"><div><p className="text-sm font-bold text-gray-900">{officer.name}</p><p className="text-xs text-gray-500 mt-1">{officer.id} · {officer.designation}</p></div><div className="text-xs"><span className="text-gray-400 block uppercase tracking-wide font-bold">Current assignment</span><span className={`font-semibold ${officer.projectId ? 'text-emerald-700' : 'text-gray-500'}`}>{officer.projectId || 'Unassigned'}</span></div><label className="text-xs font-semibold text-gray-700">Assign project<select value={officer.projectId} onChange={(event) => assignProject(officer.id, event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-[#0B3520] focus:outline-none"><option value="">No assignment</option>{INITIAL_PROJECTS.map((project) => <option key={project.id} value={project.id}>{project.id} · {project.name}</option>)}</select></label></div>)}</div></div></div>;
};

const AuditLogsView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('ALL');
  const [entries, setEntries] = useState<AuditEntry[]>(() => readAuditEntries());
  const workflowActions = ['PROJECT_SELECTED', 'VALIDATION_RUN', 'PREDICTION_COMPLETED'];
  const visibleEntries = entries.filter((entry) => action === 'ALL' || entry.action === action || (action === 'WORKFLOW_ACTIVITY' && workflowActions.includes(entry.action))).filter((entry) => `${entry.actor} ${entry.action} ${entry.entity} ${entry.entityId} ${entry.details}`.toLowerCase().includes(query.toLowerCase()));
  const auditKeys = [{ key: 'DATASET_IMPORTED', label: 'Dataset imported' }, { key: 'OFFICER_CREATED', label: 'Officer created' }, { key: 'PROJECT_ASSIGNED', label: 'Project assigned' }, { key: 'PROJECT_UNASSIGNED', label: 'Assignment cleared' }, { key: 'WORKFLOW_ACTIVITY', label: 'Project & ML activity' }];
  const refresh = () => setEntries(readAuditEntries());
  const actionOptions: string[] = Array.from(new Set(entries.map((entry) => entry.action)));
  return <div className="space-y-5"><div><h2 className="text-xl font-bold text-gray-900">Audit Logs</h2><p className="text-xs text-gray-500 mt-0.5">Trace dataset imports, officer creation, project assignments, and ML workflow activity.</p></div><div className="grid grid-cols-2 lg:grid-cols-5 gap-2">{auditKeys.map((item) => <button key={item.key} type="button" onClick={() => setAction(item.key)} className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition-colors ${action === item.key ? 'border-[#0B3520] bg-emerald-50 text-[#0B3520]' : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'}`}><span className="block text-lg font-extrabold">{item.key === 'WORKFLOW_ACTIVITY' ? entries.filter((entry) => workflowActions.includes(entry.action)).length : entries.filter((entry) => entry.action === item.key).length}</span>{item.label}</button>)}</div><div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actor, project, dataset, or detail" className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#0B3520] focus:outline-none" /><select value={action} onChange={(event) => setAction(event.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#0B3520] focus:outline-none"><option value="ALL">All actions</option>{auditKeys.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}{actionOptions.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select><button type="button" onClick={refresh} className="rounded-xl bg-[#0B3520] text-white px-4 py-2 text-xs font-bold">Refresh</button></div><div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden"><div className="p-4 border-b border-gray-100 flex items-center justify-between"><span className="text-xs font-bold text-gray-700">{visibleEntries.length} entries</span><span className="text-[11px] text-gray-400">Newest first · retained locally</span></div>{visibleEntries.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">No matching audit entries yet. Import a dataset or create an Officer account to record activity.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-gray-50 text-gray-500 uppercase tracking-wide"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Details</th></tr></thead><tbody className="divide-y divide-gray-100">{visibleEntries.map((entry) => <tr key={entry.id}><td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(entry.timestamp).toLocaleString('en-IN')}</td><td className="px-4 py-3 font-semibold">{entry.actor}</td><td className="px-4 py-3 font-mono text-[#0B3520]">{entry.action}</td><td className="px-4 py-3">{entry.entity}<span className="block text-[10px] text-gray-400">{entry.entityId}</span></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${entry.result === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : entry.result === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700'}`}>{entry.result}</span></td><td className="px-4 py-3 min-w-[260px] text-gray-600">{entry.details}</td></tr>)}</tbody></table></div>}</div></div>;
};
