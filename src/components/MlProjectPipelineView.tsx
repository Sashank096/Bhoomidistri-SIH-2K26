import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, CheckCircle2, Database, FileCheck2, FileSpreadsheet, Gauge, Loader2, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { ProjectRecord, ProjectRiskLevel, UserRole } from '../types';
import { listDatasets, saveDataset, StoredDataset } from '../services/datasetGateway';
import { INITIAL_PROJECTS } from '../data/projectsData';
import { validateProjectDataIntegrity } from '../data/projectIntegrity';
import { INITIAL_LAND_RECORDS, INITIAL_AFFECTED_FAMILIES, INITIAL_COMPENSATION_RECORDS, INITIAL_APPROVALS_RECORDS, INITIAL_LEGAL_DISPUTES, INITIAL_RR_RECORDS, INITIAL_POSSESSION_RECORDS, INITIAL_STAKEHOLDERS } from '../data/projectDataManagement';
import { INITIAL_PREDICTION_PRJ_1042 } from '../data/mlPredictionData';
import { mlPredictionService } from '../services/mlPredictionService';
import { landAcquisitionApi } from '../services/landAcquisitionApi';
import { recordAudit } from '../services/auditLogGateway';

interface MlProjectPipelineViewProps {
  userRole?: UserRole;
  onOpenProjects?: () => void;
  onOpenDataManager?: () => void;
  onOpenValidationDetails?: () => void;
  onOpenRiskDetails?: () => void;
  onOpenPredictionDetails?: () => void;
}
type ChannelId = 'land' | 'families' | 'compensation' | 'field';
interface Channel { id: ChannelId; title: string; description: string; columns: string; fileName: string; status: 'Ready' | 'Missing'; }

const sampleRows: Array<{ id: string; parcel: string; owner: string; status: string; delay: string }> = [];
const sectionClass = 'rounded-2xl border border-gray-200 bg-white shadow-sm';
const riskTone: Record<ProjectRiskLevel, string> = { LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200', MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200', HIGH: 'text-orange-700 bg-orange-50 border-orange-200', CRITICAL: 'text-red-700 bg-red-50 border-red-200' };

export const MlProjectPipelineView: React.FC<MlProjectPipelineViewProps> = ({ userRole = 'Administrator', onOpenProjects, onOpenDataManager, onOpenValidationDetails, onOpenRiskDetails, onOpenPredictionDetails }) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<ProjectRecord[]>(INITIAL_PROJECTS);
  const [rows, setRows] = useState(sampleRows);
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'land', title: 'Land & parcels', description: 'Survey, area, ownership, and acquisition status.', columns: 'parcel_id · survey_number · area · owner', fileName: 'Not uploaded', status: 'Missing' },
    { id: 'families', title: 'Affected families', description: 'Family, landowner, contact, and eligibility records.', columns: 'family_id · parcel_id · family_size · eligibility', fileName: 'Not uploaded', status: 'Missing' },
    { id: 'compensation', title: 'Compensation', description: 'Awards, paid amounts, disputes, and pending balances.', columns: 'family_id · parcel_id · award · paid · status', fileName: 'Not uploaded', status: 'Missing' },
    { id: 'field', title: 'Legal & field status', description: 'Court, possession, encumbrance, and current field updates.', columns: 'case_status · possession · due_date · delay', fileName: 'Not uploaded', status: 'Missing' },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(INITIAL_PREDICTION_PRJ_1042);
  const [notice, setNotice] = useState('');
  const [storedDatasets, setStoredDatasets] = useState<StoredDataset[]>([]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const validation = useMemo(() => validateProjectDataIntegrity({ landRecords: INITIAL_LAND_RECORDS, families: INITIAL_AFFECTED_FAMILIES, compensationRecords: INITIAL_COMPENSATION_RECORDS, approvals: INITIAL_APPROVALS_RECORDS, legalDisputes: INITIAL_LEGAL_DISPUTES, rrRecords: INITIAL_RR_RECORDS, possessionRecords: INITIAL_POSSESSION_RECORDS, stakeholders: INITIAL_STAKEHOLDERS }), []);
  const qualityScore = validation.totalRecords === 0 ? 100 : Math.round((validation.validRecords / validation.totalRecords) * 100);
  const riskLevel = prediction.overall.riskLevel;
  const readyChannels = channels.filter((channel) => channel.status === 'Ready').length;

  React.useEffect(() => {
    landAcquisitionApi.listProjects().then((records) => {
      const mapped = records.map((record) => ({
        id: record.project_id, name: record.project_name, projectType: 'Other' as ProjectRecord['projectType'], state: record.state, district: record.district,
        location: [record.mandal_taluk, record.district, record.state].filter(Boolean).join(', '), department: String(record.department || ''), startDate: String(record.start_date || ''), targetCompletionDate: String(record.planned_completion_date || ''), description: String(record.description || ''), status: 'Active' as ProjectRecord['status'], riskLevel: 'LOW' as ProjectRecord['riskLevel'], delayProbability: 0, delayDays: 0, totalParcels: Number(record.target_parcels || 0), acquiredParcels: Number(record.matched_parcels || 0), disputedParcels: 0, budgetCr: Number(record.budget_inr || 0) / 10000000, assignedOfficer: String(record.officer_id || 'Unassigned'), officerId: String(record.officer_id || ''), createdBy: 'Backend', createdAt: String(record.created_at || ''), lastUpdated: String(record.updated_at || ''), stage: String(record.status || 'Reference'),
      }));
      setProjects(mapped);
      setSelectedProjectId((current) => current || mapped[0]?.id || '');
    }).catch(() => undefined);
  }, []);

  React.useEffect(() => { if (selectedProjectId) listDatasets(selectedProjectId).then(setStoredDatasets).catch(() => setStoredDatasets([])); }, [selectedProjectId]);

  const handleChannelFile = async (id: ChannelId, file?: File) => {
    if (!file) return;
    try {
      const stored = await saveDataset(selectedProjectId, id, file);
      setStoredDatasets((current) => [stored, ...current.filter((dataset) => dataset.id !== stored.id)]);
    } catch { setNotice('The file could not be stored in the dataset gateway.'); return; }
    setChannels((current) => current.map((channel) => channel.id === id ? { ...channel, fileName: file.name, status: 'Ready' } : channel));
    setNotice(`${file.name} stored in the dataset gateway for ${selectedProjectId}. All downstream steps use this project snapshot.`);
  };
  const runAnalysis = async () => {
    if (!validation.mlReady || readyChannels < 4) { setNotice('Complete all four data channels and resolve blocking validation errors before running prediction.'); return; }
    setIsAnalyzing(true); setNotice('Running validation, feature engineering, risk analysis, and prediction...');
    try { recordAudit({ actor: String(userRole), action: 'VALIDATION_RUN', entity: 'Project', entityId: selectedProjectId, result: 'SUCCESS', details: 'Validation gate passed before ML analysis.' }); setPrediction(await mlPredictionService.executePredictionPipeline(selectedProjectId, userRole as UserRole)); recordAudit({ actor: String(userRole), action: 'PREDICTION_COMPLETED', entity: 'Project', entityId: selectedProjectId, result: 'SUCCESS', details: 'Risk analysis and prediction completed from the validated snapshot.' }); setNotice('Pipeline completed from the validated project snapshot.'); }
    catch { setNotice('Prediction could not be completed. Check the input data and try again.'); }
    finally { setIsAnalyzing(false); }
  };

  return <div className="space-y-6 pb-10">
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0B3520]"><Sparkles className="w-4 h-4 text-[#B8860B]" /> Integrated ML project pipeline</div><h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">Select and analyze a project</h1><p className="text-sm text-gray-500 mt-1">One project snapshot flows through four data channels, validation, risk analysis, and prediction.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"><ShieldCheck className="w-4 h-4" /> {userRole} session</span></header>
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center gap-3"><label className="text-xs font-bold text-[#0B3520]">Project to analyze<select value={selectedProjectId} onChange={(event) => { setSelectedProjectId(event.target.value); recordAudit({ actor: String(userRole), action: 'PROJECT_SELECTED', entity: 'Project', entityId: event.target.value, result: 'INFO', details: 'Project selected for the integrated ML pipeline.' }); setNotice('Project selected. Review its four input channels before analysis.'); }} className="block mt-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 min-w-[280px]">{projects.map((project) => <option key={project.id} value={project.id}>{project.id} · {project.name}</option>)}</select></label><div className="sm:ml-auto text-xs text-emerald-900"><b>{selectedProject?.state || 'India'}</b> · {selectedProject?.district || 'Project district'} · {readyChannels}/4 channels ready</div></section>
    {notice && <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{notice}</div>}
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0B3520]">Recovered workspace tools</p><p className="text-xs text-gray-500 mt-1">Earlier project, validation, risk, and prediction features remain available here.</p></div><div className="flex flex-wrap gap-2">{onOpenProjects && <ToolButton label="Projects" onClick={onOpenProjects} />}{onOpenDataManager && <ToolButton label="Data manager" onClick={onOpenDataManager} />}{onOpenValidationDetails && <ToolButton label="Validation details" onClick={onOpenValidationDetails} />}{onOpenRiskDetails && <ToolButton label="Risk details" onClick={onOpenRiskDetails} />}{onOpenPredictionDetails && <ToolButton label="Prediction history" onClick={onOpenPredictionDetails} />}</div></div></section>

    <section className={sectionClass}><StepHeading number="1" title="Data Input" subtitle="Keep the four project templates linked by the selected project ID." icon={<UploadCloud className="w-5 h-5" />} /><div className="p-5 pt-0 grid gap-3 md:grid-cols-2">{channels.map((channel) => <label key={channel.id} className="rounded-xl border border-gray-200 p-4 hover:border-[#0B3520] cursor-pointer"><div className="flex items-start gap-3"><FileSpreadsheet className="w-6 h-6 text-[#0B3520] shrink-0" /><div className="min-w-0"><div className="flex items-center justify-between gap-2"><b className="text-sm text-gray-900">{channel.title}</b><span className={`text-[10px] font-bold rounded-full px-2 py-1 ${channel.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{channel.status}</span></div><p className="text-xs text-gray-500 mt-1">{channel.description}</p><p className="text-[10px] text-gray-400 font-mono mt-2 truncate">{channel.columns}</p><p className="text-[11px] font-semibold text-[#0B3520] mt-2 truncate">{channel.fileName}</p></div></div><input type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={(event) => handleChannelFile(channel.id, event.target.files?.[0])} /></label>)}</div><div className="mx-5 mb-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex items-center gap-2"><Database className="w-4 h-4 text-[#0B3520]" /><p className="text-xs font-bold text-[#0B3520]">Dataset gateway · {storedDatasets.length} stored file{storedDatasets.length === 1 ? '' : 's'}</p></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{storedDatasets.map((dataset) => <div key={dataset.id} className="rounded-lg bg-white border border-emerald-100 px-3 py-2 text-[11px] flex items-center justify-between gap-3"><span className="truncate"><b>{dataset.fileName}</b><span className="block text-gray-500">{(dataset.sizeBytes / 1024).toFixed(1)} KB · {new Date(dataset.uploadedAt).toLocaleString('en-IN')}</span></span><span className="font-bold text-emerald-700">Stored</span></div>)}</div>{storedDatasets.length === 0 && <p className="text-[11px] text-emerald-800 mt-2">Upload a CSV, Excel, or JSON file to store it against this project.</p>}</div><div className="px-5 pb-5 overflow-x-auto"><table className="w-full text-left text-xs rounded-xl overflow-hidden border border-gray-200"><thead className="bg-gray-50 text-gray-500 uppercase tracking-wide"><tr><th className="px-4 py-3">Row</th><th className="px-4 py-3">Parcel ID</th><th className="px-4 py-3">Landowner</th><th className="px-4 py-3">Current status</th><th className="px-4 py-3">Delay days</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-mono text-gray-500">{row.id}</td><td className="px-4 py-3 font-bold text-[#0B3520]">{row.parcel}</td><td className="px-4 py-3">{row.owner}</td><td className="px-4 py-3">{row.status}</td><td className="px-4 py-3 font-semibold">{row.delay}</td></tr>)}</tbody></table></div></section>
    <div className="flex justify-center -my-3 relative z-10"><ArrowDown className="w-5 h-5 text-[#B8860B] bg-[#F4F7F5]" /></div>
    <section className={sectionClass}><StepHeading number="2" title="Data Validation" subtitle="Every validation result belongs to the selected project snapshot." icon={<Database className="w-5 h-5" />} /><div className="p-5 pt-0"><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"><Kpi label="Quality score" value={`${qualityScore}%`} tone="text-emerald-700" /><Kpi label="Records checked" value={validation.totalRecords || rows.length} tone="text-gray-900" /><Kpi label="Blocking errors" value={validation.errorsCount} tone={validation.errorsCount ? 'text-red-700' : 'text-emerald-700'} /><Kpi label="Warnings" value={validation.warningsCount} tone={validation.warningsCount ? 'text-amber-700' : 'text-emerald-700'} /></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-sm text-emerald-800"><FileCheck2 className="w-5 h-5" /><span><b>{validation.mlReady ? 'Validation gate passed.' : 'Validation gate blocked.'}</b> {validation.mlReady ? 'Cross-module references are ready for risk analysis.' : 'Resolve the listed issues before analysis.'}</span></div></div></section>
    <div className="flex justify-center -my-3 relative z-10"><ArrowDown className="w-5 h-5 text-[#B8860B] bg-[#F4F7F5]" /></div>
    <section className={sectionClass}><StepHeading number="3" title="Risk Analysis" subtitle="Risk is calculated from the same validated input used for the forecast." icon={<Gauge className="w-5 h-5" />} /><div className="p-5 pt-0 grid lg:grid-cols-[220px_1fr] gap-5"><div className={`rounded-2xl border p-5 flex flex-col items-center justify-center ${riskTone[riskLevel]}`}><span className="text-[11px] uppercase tracking-wider font-bold">Overall risk</span><strong className="text-4xl font-extrabold mt-2">{Math.round(prediction.overall.riskScore * 100)}</strong><span className="text-sm font-extrabold mt-1">{riskLevel}</span><span className="text-xs mt-2">{prediction.overall.delayProbability}% delay probability</span></div><div className="space-y-3"><h3 className="text-sm font-extrabold text-gray-900">Top drivers</h3>{prediction.topRiskContributors.slice(0, 3).map((factor, index) => <div key={index} className="rounded-xl border border-gray-200 p-3 flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span><div><p className="text-sm font-bold text-gray-800">{factor.factor}</p><p className="text-xs text-gray-500 mt-1">{factor.impact}</p></div></div>)}</div></div></section>
    <div className="flex justify-center -my-3 relative z-10"><ArrowDown className="w-5 h-5 text-[#B8860B] bg-[#F4F7F5]" /></div>
    <section className={sectionClass}><StepHeading number="4" title="Prediction Results" subtitle="The model runs only after all four channels are present and validated." icon={<Sparkles className="w-5 h-5" />} /><div className="p-5 pt-0"><div className="grid sm:grid-cols-3 gap-3"><Kpi label="Predicted delay" value={`${prediction.overall.expectedDelayDays} days`} tone="text-orange-700" /><Kpi label="Expected timeline" value={`${prediction.overall.expectedDelayMonths} months`} tone="text-gray-900" /><Kpi label="Confidence" value={`${prediction.overall.confidence}%`} tone="text-emerald-700" /></div><button type="button" onClick={runAnalysis} disabled={isAnalyzing || !validation.mlReady || readyChannels < 4} className="mt-5 rounded-xl bg-[#0B3520] text-white px-5 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">{isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Running pipeline...</> : 'Run complete pipeline'}</button></div></section>
    <footer className="rounded-2xl bg-[#0B3520] text-white p-5 sm:p-6"><div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#EAB308] shrink-0" /><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Project summary</p><p className="text-sm mt-1 leading-6">{selectedProject?.name || selectedProjectId} has <b>{qualityScore}%</b> data quality across <b>{readyChannels}/4 channels</b>. Current model output is <b>{riskLevel}</b> risk with an estimated delay of <b>{prediction.overall.expectedDelayDays} days</b> at <b>{prediction.overall.confidence}%</b> confidence.</p></div></div></footer>
  </div>;
};

const StepHeading: React.FC<{ number: string; title: string; subtitle: string; icon: React.ReactNode }> = ({ number, title, subtitle, icon }) => <div className="p-5 flex items-start gap-3"><span className="w-9 h-9 rounded-xl bg-[#0B3520] text-white flex items-center justify-center text-sm font-extrabold shrink-0">{number}</span><div className="flex-1"><div className="flex items-center gap-2 text-[#0B3520]"><h2 className="text-lg font-extrabold text-gray-900">{title}</h2>{icon}</div><p className="text-xs text-gray-500 mt-1">{subtitle}</p></div></div>;
const Kpi: React.FC<{ label: string; value: string | number; tone: string }> = ({ label, value, tone }) => <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-[10px] uppercase tracking-wide font-bold text-gray-500">{label}</p><p className={`text-2xl font-extrabold mt-1 ${tone}`}>{value}</p></div>;
const ToolButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => <button type="button" onClick={onClick} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-700 hover:border-[#0B3520] hover:bg-emerald-50 hover:text-[#0B3520]">{label}</button>;
