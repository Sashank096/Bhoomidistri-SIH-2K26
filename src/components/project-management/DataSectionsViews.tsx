import React, { useState } from 'react';
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
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  X,
  FileUp,
  Percent,
} from 'lucide-react';
import {
  DataSectionId,
  LandRecordItem,
  AffectedFamilyItem,
  CompensationItem,
  ApprovalItem,
  LegalDisputeItem,
  DocumentItem,
  RrItem,
  PossessionItem,
  StakeholderItem,
  UserRole,
} from '../../types';

interface DataSectionsViewsProps {
  activeSection: DataSectionId;
  landRecords: LandRecordItem[];
  setLandRecords: React.Dispatch<React.SetStateAction<LandRecordItem[]>>;
  families: AffectedFamilyItem[];
  setFamilies: React.Dispatch<React.SetStateAction<AffectedFamilyItem[]>>;
  compensationRecords: CompensationItem[];
  setCompensationRecords: React.Dispatch<React.SetStateAction<CompensationItem[]>>;
  approvals: ApprovalItem[];
  setApprovals: React.Dispatch<React.SetStateAction<ApprovalItem[]>>;
  legalDisputes: LegalDisputeItem[];
  setLegalDisputes: React.Dispatch<React.SetStateAction<LegalDisputeItem[]>>;
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  rrRecords: RrItem[];
  setRrRecords: React.Dispatch<React.SetStateAction<RrItem[]>>;
  possessionRecords: PossessionItem[];
  setPossessionRecords: React.Dispatch<React.SetStateAction<PossessionItem[]>>;
  stakeholders: StakeholderItem[];
  setStakeholders: React.Dispatch<React.SetStateAction<StakeholderItem[]>>;
  userRole: UserRole;
  onOpenUploadForSection: (section: DataSectionId) => void;
  onAuditLog: (action: any, dataset: string, details?: string) => void;
}

export const DataSectionsViews: React.FC<DataSectionsViewsProps> = ({
  activeSection,
  landRecords,
  setLandRecords,
  families,
  setFamilies,
  compensationRecords,
  setCompensationRecords,
  approvals,
  setApprovals,
  legalDisputes,
  setLegalDisputes,
  documents,
  setDocuments,
  rrRecords,
  setRrRecords,
  possessionRecords,
  setPossessionRecords,
  stakeholders,
  setStakeholders,
  userRole,
  onOpenUploadForSection,
  onAuditLog,
}) => {
  const canEdit = userRole === 'Administrator' || userRole === 'Officer';

  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<DataSectionId | null>(null);

  // Forms State
  const [newLand, setNewLand] = useState<Partial<LandRecordItem>>({
    surveyNumber: '',
    khasraNumber: '',
    areaValue: 1.0,
    areaUnit: 'Acres',
    landType: 'Agricultural',
    ownership: 'Private',
    ownerName: '',
    village: 'Kathipudi',
    acquisitionStatus: 'Notice Issued',
    estimatedCompensation: 500000,
  });

  const [newFamily, setNewFamily] = useState<Partial<AffectedFamilyItem>>({
    headOfFamily: '',
    associatedLandId: landRecords[0]?.id || '',
    landArea: '1.0 acres',
    familyMembersCount: 4,
    compensationAmount: 500000,
    paymentStatus: 'Pending',
    rrEligibility: 'Eligible',
  });

  const [newComp, setNewComp] = useState<Partial<CompensationItem>>({
    familyId: families[0]?.id || '',
    landId: landRecords[0]?.id || '',
    headOfFamily: families[0]?.headOfFamily || '',
    compensationAmount: 1000000,
    amountPaid: 0,
    paymentDate: '',
    paymentStatus: 'Pending',
    paymentMode: 'Direct Benefit Transfer (DBT - PFMS)',
  });

  const [newApproval, setNewApproval] = useState<Partial<ApprovalItem>>({
    approvalType: 'Environmental Clearance (MoEFCC Stage-II)',
    issuingAuthority: 'Ministry of Environment, Forest & Climate Change',
    requiredDate: '2026-09-01',
    actualDate: '',
    status: 'Under Review',
    delayDays: 0,
    remarks: '',
  });

  const [newLegal, setNewLegal] = useState<Partial<LegalDisputeItem>>({
    caseType: 'Compensation Rate Challenge (RFCTLARR Sec 64)',
    courtAuthority: 'Land Acquisition Tribunal (LARR Authority)',
    filingDate: new Date().toISOString().split('T')[0],
    petitioner: '',
    currentStatus: 'Filed',
    expectedResolution: '2026-12-31',
    stayOrderActive: false,
    summary: '',
  });

  const [newRr, setNewRr] = useState<Partial<RrItem>>({
    familyId: families[0]?.id || '',
    headOfFamily: families[0]?.headOfFamily || '',
    eligibility: 'Eligible',
    rrPackage: 'Residential Plot + Livelihood Rehabilitation Grant',
    progress: 50,
    status: 'In Progress',
    allocatedSite: 'Annavaram R&R Layout, Sector C',
  });

  const [newPossession, setNewPossession] = useState<Partial<PossessionItem>>({
    landId: landRecords[0]?.id || '',
    surveyNumber: landRecords[0]?.surveyNumber || '',
    village: 'Kathipudi',
    possessionStatus: 'Partially Completed',
    possessionDate: '',
    pendingParcels: 5,
    reasonForDelay: 'Joint valuation verification pending',
    jointSurveyConducted: true,
  });

  const [newStakeholder, setNewStakeholder] = useState<Partial<StakeholderItem>>({
    stakeholder: 'Landowners Committee',
    contactPerson: '',
    responseStatus: 'Pending',
    meetingDate: new Date().toISOString().split('T')[0],
    issue: '',
    resolution: 'Under Review',
  });

  // Dedicated Document Upload Drag/Drop State
  const [docUploadDragOver, setDocUploadDragOver] = useState(false);
  const [uploadingDocProgress, setUploadingDocProgress] = useState<number | null>(null);

  // ---------------- Handlers for Add Operations ----------------
  const handleAddLand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLand.surveyNumber) return;
    const item: LandRecordItem = {
      id: `LND-${String(landRecords.length + 1).padStart(3, '0')}`,
      surveyNumber: newLand.surveyNumber || '',
      khasraNumber: newLand.khasraNumber || `K-${Math.floor(100 + Math.random() * 900)}`,
      areaValue: Number(newLand.areaValue) || 1.0,
      areaUnit: newLand.areaUnit as any || 'Acres',
      landType: newLand.landType as any || 'Agricultural',
      ownership: newLand.ownership as any || 'Private',
      ownerName: newLand.ownerName || 'Private Landowner',
      village: newLand.village || 'Kathipudi',
      acquisitionStatus: newLand.acquisitionStatus as any || 'Notice Issued',
      estimatedCompensation: Number(newLand.estimatedCompensation) || 0,
      remarks: newLand.remarks || '',
    };
    setLandRecords([item, ...landRecords]);
    onAuditLog('DATA_CREATED', 'Land Details', `Added Land Record ${item.id} (${item.surveyNumber})`);
    setModalType(null);
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.headOfFamily) return;
    const selectedLand = landRecords.find((l) => l.id === newFamily.associatedLandId) || landRecords[0];
    const item: AffectedFamilyItem = {
      id: `FAM-${String(families.length + 1).padStart(3, '0')}`,
      headOfFamily: newFamily.headOfFamily || '',
      associatedLandId: selectedLand?.id || 'LND-001',
      surveyNumber: selectedLand?.surveyNumber || '124/2A',
      landArea: `${selectedLand?.areaValue || 1.0} ${selectedLand?.areaUnit || 'Acres'}`,
      familyMembersCount: Number(newFamily.familyMembersCount) || 4,
      compensationAmount: Number(newFamily.compensationAmount) || 500000,
      paymentStatus: newFamily.paymentStatus as any || 'Pending',
      rrEligibility: newFamily.rrEligibility as any || 'Eligible',
      contactNo: newFamily.contactNo || '+91 98480 00000',
      bankAccountLinked: true,
    };
    setFamilies([item, ...families]);
    onAuditLog('DATA_CREATED', 'Affected Families', `Registered family ${item.id} (${item.headOfFamily})`);
    setModalType(null);
  };

  const handleAddCompensation = (e: React.FormEvent) => {
    e.preventDefault();
    const compAmount = Number(newComp.compensationAmount) || 0;
    const amtPaid = Math.min(Number(newComp.amountPaid) || 0, compAmount);
    const amtPending = Math.max(0, compAmount - amtPaid);
    const item: CompensationItem = {
      id: `CMP-${String(compensationRecords.length + 1).padStart(3, '0')}`,
      familyId: newComp.familyId || families[0]?.id || 'FAM-001',
      landId: newComp.landId || landRecords[0]?.id || 'LND-001',
      headOfFamily: newComp.headOfFamily || 'Family Head',
      compensationAmount: compAmount,
      amountPaid: amtPaid,
      amountPending: amtPending,
      paymentDate: newComp.paymentDate || '—',
      paymentStatus: amtPaid === 0 ? 'Pending' : amtPaid === compAmount ? 'Completed' : 'Partial',
      paymentMode: newComp.paymentMode || 'Direct Benefit Transfer (DBT - PFMS)',
    };
    setCompensationRecords([item, ...compensationRecords]);
    onAuditLog('DATA_CREATED', 'Compensation', `Added compensation entry ${item.id}`);
    setModalType(null);
  };

  const handleAddApproval = (e: React.FormEvent) => {
    e.preventDefault();
    const reqD = new Date(newApproval.requiredDate || '2026-08-01').getTime();
    const actD = newApproval.actualDate ? new Date(newApproval.actualDate).getTime() : reqD;
    const diffDays = Math.max(0, Math.round((actD - reqD) / (1000 * 60 * 60 * 24)));

    const item: ApprovalItem = {
      id: `APP-${String(approvals.length + 1).padStart(3, '0')}`,
      approvalType: newApproval.approvalType || 'Statutory Clearance',
      issuingAuthority: newApproval.issuingAuthority || 'Competent Authority',
      requiredDate: newApproval.requiredDate || '2026-08-01',
      actualDate: newApproval.actualDate || '—',
      status: newApproval.status as any || 'Under Review',
      delayDays: newApproval.actualDate ? diffDays : 0,
      remarks: newApproval.remarks || '',
    };
    setApprovals([item, ...approvals]);
    onAuditLog('DATA_CREATED', 'Approvals', `Added approval clearance ${item.id}`);
    setModalType(null);
  };

  const handleAddLegal = (e: React.FormEvent) => {
    e.preventDefault();
    const item: LegalDisputeItem = {
      id: `CAS-${Math.floor(400 + Math.random() * 500)}`,
      caseType: newLegal.caseType || 'Compensation Dispute',
      courtAuthority: newLegal.courtAuthority || 'Tribunal',
      filingDate: newLegal.filingDate || '2026-08-01',
      petitioner: newLegal.petitioner || 'Landowner',
      currentStatus: newLegal.currentStatus as any || 'Filed',
      expectedResolution: newLegal.expectedResolution || '2026-12-31',
      stayOrderActive: Boolean(newLegal.stayOrderActive),
      summary: newLegal.summary || '',
    };
    setLegalDisputes([item, ...legalDisputes]);
    onAuditLog('DATA_CREATED', 'Legal Disputes', `Added legal dispute record ${item.id}`);
    setModalType(null);
  };

  const handleAddRr = (e: React.FormEvent) => {
    e.preventDefault();
    const item: RrItem = {
      id: `RR-${String(rrRecords.length + 1).padStart(3, '0')}`,
      familyId: newRr.familyId || families[0]?.id || 'FAM-001',
      headOfFamily: newRr.headOfFamily || 'Family Head',
      eligibility: newRr.eligibility as any || 'Eligible',
      rrPackage: newRr.rrPackage || 'Residential Plot + Grant',
      progress: Number(newRr.progress) || 0,
      status: Number(newRr.progress) >= 100 ? 'Completed' : Number(newRr.progress) > 0 ? 'In Progress' : 'Not Started',
      allocatedSite: newRr.allocatedSite || 'Designated R&R Colony',
      subsistenceAllowancePaid: true,
    };
    setRrRecords([item, ...rrRecords]);
    onAuditLog('DATA_CREATED', 'R&R', `Added R&R record ${item.id}`);
    setModalType(null);
  };

  const handleAddPossession = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLand = landRecords.find((l) => l.id === newPossession.landId) || landRecords[0];
    const item: PossessionItem = {
      id: `POS-${String(possessionRecords.length + 1).padStart(3, '0')}`,
      landId: selectedLand?.id || 'LND-001',
      surveyNumber: selectedLand?.surveyNumber || '124/2A',
      village: newPossession.village || 'Kathipudi',
      possessionStatus: newPossession.possessionStatus as any || 'Partially Completed',
      possessionDate: newPossession.possessionDate || '—',
      pendingParcels: Number(newPossession.pendingParcels) || 0,
      reasonForDelay: newPossession.reasonForDelay || 'Standing crop harvest',
      jointSurveyConducted: Boolean(newPossession.jointSurveyConducted),
      physicalHandoverToAgency: 'NHAI Executing Agency',
    };
    setPossessionRecords([item, ...possessionRecords]);
    onAuditLog('DATA_CREATED', 'Possession', `Added possession status record ${item.id}`);
    setModalType(null);
  };

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    const item: StakeholderItem = {
      id: `STK-${String(stakeholders.length + 1).padStart(3, '0')}`,
      stakeholder: newStakeholder.stakeholder || 'Landowners Committee',
      contactPerson: newStakeholder.contactPerson || 'Representative',
      responseStatus: newStakeholder.responseStatus as any || 'Pending',
      meetingDate: newStakeholder.meetingDate || '2026-08-28',
      issue: newStakeholder.issue || 'Consultation topic',
      resolution: newStakeholder.resolution || 'Under Review',
    };
    setStakeholders([item, ...stakeholders]);
    onAuditLog('DATA_CREATED', 'Stakeholders', `Recorded stakeholder consultation ${item.id}`);
    setModalType(null);
  };

  // Document Upload Simulation
  const handleDocumentDrop = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingDocProgress(15);
    const interval = setInterval(() => {
      setUploadingDocProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadingDocProgress(null);
            // Mark first missing doc or add new doc
            const missingDocIndex = documents.findIndex((d) => d.verificationStatus === 'Missing');
            if (missingDocIndex >= 0) {
              const updated = [...documents];
              updated[missingDocIndex] = {
                ...updated[missingDocIndex],
                isUploaded: true,
                verificationStatus: 'Pending',
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                uploadDate: new Date().toISOString().split('T')[0],
              };
              setDocuments(updated);
            } else {
              setDocuments([
                {
                  id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
                  name: file.name.replace(/\.[^/.]+$/, ''),
                  category: 'Revenue Record',
                  isRequired: true,
                  isUploaded: true,
                  verificationStatus: 'Pending',
                  fileName: file.name,
                  fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  uploadDate: new Date().toISOString().split('T')[0],
                  expiryDate: 'N/A',
                },
                ...documents,
              ]);
            }
            onAuditLog('DOCUMENT_UPLOADED', 'Documents', `Uploaded statutory document ${file.name}`);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Helper for deleting an item
  const handleDeleteItem = (dataset: string, id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!canEdit) return;
    setter((prev) => prev.filter((item) => item.id !== id));
    onAuditLog('DATA_DELETED', dataset, `Deleted record ${id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
      {/* ---------------- 01. LAND DETAILS ---------------- */}
      {activeSection === 'land' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0B3520]" />
                <span>01. Land Details</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {landRecords.length} Parcels
                </span>
              </h2>
              <p className="text-xs text-gray-500">Record and manage land parcels associated with this project.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalType('land')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Land Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenUploadForSection('land')}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Import CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Land ID</th>
                  <th className="p-3">Survey No.</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Land Type</th>
                  <th className="p-3">Ownership</th>
                  <th className="p-3">Owner Name</th>
                  <th className="p-3">Acquisition Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {landRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B3520]">{r.id}</td>
                    <td className="p-3 font-semibold text-gray-900">{r.surveyNumber}</td>
                    <td className="p-3 font-mono font-medium">{r.areaValue} {r.areaUnit}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                        {r.landType}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{r.ownership}</td>
                    <td className="p-3 text-gray-800 font-medium truncate max-w-[140px]">{r.ownerName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.acquisitionStatus === 'Possession Taken' || r.acquisitionStatus === 'Acquired'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.acquisitionStatus === 'Disputed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.acquisitionStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Land Details', r.id, setLandRecords)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 02. AFFECTED FAMILIES ---------------- */}
      {activeSection === 'families' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0B3520]" />
                <span>02. Affected Families</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {families.length} Families
                </span>
              </h2>
              <p className="text-xs text-gray-500">Record families affected by land acquisition activities.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalType('families')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Family Record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenUploadForSection('families')}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Import CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Family ID</th>
                  <th className="p-3">Head of Family</th>
                  <th className="p-3">Land ID &amp; Area</th>
                  <th className="p-3">Members</th>
                  <th className="p-3">Compensation</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">R&amp;R Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {families.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B3520]">{f.id}</td>
                    <td className="p-3 font-semibold text-gray-900">{f.headOfFamily}</td>
                    <td className="p-3">
                      <span className="font-mono text-gray-800">{f.associatedLandId}</span>
                      <span className="text-gray-400 text-[11px] ml-1">({f.landArea})</span>
                    </td>
                    <td className="p-3 text-gray-700">{f.familyMembersCount} persons</td>
                    <td className="p-3 font-mono font-bold text-gray-900">
                      ₹{f.compensationAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          f.paymentStatus === 'Disbursed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold text-[11px]">
                        {f.rrEligibility}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Affected Families', f.id, setFamilies)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 03. COMPENSATION ---------------- */}
      {activeSection === 'compensation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#0B3520]" />
                <span>03. Compensation Assessment &amp; Disbursement</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {compensationRecords.length} Records
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Track compensation assessment and payment progress. (Amount Pending = Amount Assessed - Amount Paid).
              </p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => setModalType('compensation')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Compensation Award</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Award ID</th>
                  <th className="p-3">Beneficiary (Family ID)</th>
                  <th className="p-3">Total Compensation</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Amount Pending</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {compensationRecords.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B3520]">{c.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{c.headOfFamily}</div>
                      <div className="text-[11px] font-mono text-gray-400">{c.familyId} | {c.landId}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-gray-900">
                      ₹{c.compensationAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-emerald-700 font-semibold">
                      ₹{c.amountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono font-bold text-red-600">
                      ₹{c.amountPending.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-gray-600">{c.paymentDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          c.paymentStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.paymentStatus === 'Disputed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Compensation', c.id, setCompensationRecords)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 04. APPROVALS ---------------- */}
      {activeSection === 'approvals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0B3520]" />
                <span>04. Statutory Approvals &amp; Clearances</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {approvals.length} Clearances
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Track environmental, forest, railway, and statutory clearance timelines. (Delay = Actual Date - Required Date).
              </p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => setModalType('approvals')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Clearance Milestone</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Approval Type</th>
                  <th className="p-3">Issuing Authority</th>
                  <th className="p-3">Required Date</th>
                  <th className="p-3">Actual Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Delay (Days)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {approvals.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-semibold text-gray-900">{a.approvalType}</td>
                    <td className="p-3 text-gray-600">{a.issuingAuthority}</td>
                    <td className="p-3 font-mono text-gray-700">{a.requiredDate}</td>
                    <td className="p-3 font-mono text-gray-700">{a.actualDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          a.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'Delayed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {a.delayDays > 0 ? (
                        <span className="text-red-600 font-mono font-bold">+{a.delayDays} days</span>
                      ) : (
                        <span className="text-emerald-700 font-mono">On Schedule</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Approvals', a.id, setApprovals)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 05. LEGAL DISPUTES ---------------- */}
      {activeSection === 'legal' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#0B3520]" />
                <span>05. Legal Disputes &amp; Litigation</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {legalDisputes.length} Cases
                </span>
              </h2>
              <p className="text-xs text-gray-500">Track court cases, stay orders, and tribunal proceedings.</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => setModalType('legal')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Legal Case</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Case Type</th>
                  <th className="p-3">Court / Authority</th>
                  <th className="p-3">Filing Date</th>
                  <th className="p-3">Petitioner</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Expected Resolution</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {legalDisputes.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B3520]">{l.id}</td>
                    <td className="p-3 font-semibold text-gray-900">{l.caseType}</td>
                    <td className="p-3 text-gray-700">{l.courtAuthority}</td>
                    <td className="p-3 font-mono text-gray-600">{l.filingDate}</td>
                    <td className="p-3 text-gray-800">{l.petitioner}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                        {l.currentStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-700">{l.expectedResolution}</td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Legal Disputes', l.id, setLegalDisputes)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 06. DOCUMENTS ---------------- */}
      {activeSection === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B3520]" />
                <span>06. Statutory Project Documents</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {documents.length} Records
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Manage mandatory project documentation, notifications, and verification status.
              </p>
            </div>
          </div>

          {/* Dedicated Document Upload Component */}
          {canEdit && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDocUploadDragOver(true);
              }}
              onDragLeave={() => setDocUploadDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDocUploadDragOver(false);
                handleDocumentDrop(e.dataTransfer.files);
              }}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
                docUploadDragOver
                  ? 'border-[#0B3520] bg-[#0B3520]/5 scale-[1.01]'
                  : 'border-gray-300 bg-slate-50 hover:bg-slate-100/60'
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center mx-auto text-[#0B3520]">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Upload Statutory Document</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Drag &amp; drop PDF, DOCX, JPG, or PNG files here, or browse from device
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse Document</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentDrop(e.target.files)}
                  />
                </label>

                {uploadingDocProgress !== null && (
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                      <span>Uploading &amp; Scanning Checksum...</span>
                      <span>{uploadingDocProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B3520] h-full transition-all duration-150 rounded-full"
                        style={{ width: `${uploadingDocProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Document Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Required</th>
                  <th className="p-3">Uploaded File</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-semibold text-gray-900">{d.name}</td>
                    <td className="p-3 text-gray-600">{d.category}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                        {d.isRequired ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-3">
                      {d.fileName ? (
                        <span className="font-mono text-gray-800 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#0B3520]" />
                          {d.fileName} <span className="text-gray-400">({d.fileSize})</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No file attached</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          d.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.verificationStatus === 'Missing'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.verificationStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Documents', d.id, setDocuments)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 07. R&R ---------------- */}
      {activeSection === 'rr' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#0B3520]" />
                <span>07. Rehabilitation &amp; Resettlement (R&amp;R)</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {rrRecords.length} Packages
                </span>
              </h2>
              <p className="text-xs text-gray-500">Track resettlement entitlements, housing plots, and livelihood grants.</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => setModalType('rr')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add R&amp;R Allocation</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">R&amp;R ID</th>
                  <th className="p-3">Beneficiary Family</th>
                  <th className="p-3">Eligibility</th>
                  <th className="p-3">Sanctioned Package</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rrRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B3520]">{r.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{r.headOfFamily}</div>
                      <div className="text-[11px] font-mono text-gray-400">{r.familyId}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-medium">
                        {r.eligibility}
                      </span>
                    </td>
                    <td className="p-3 text-gray-800 font-medium">{r.rrPackage}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0B3520] h-full rounded-full"
                            style={{ width: `${r.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-gray-700">{r.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('R&R', r.id, setRrRecords)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 08. POSSESSION ---------------- */}
      {activeSection === 'possession' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#0B3520]" />
                <span>08. Land Possession &amp; Handover</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {possessionRecords.length} Blocks
                </span>
              </h2>
              <p className="text-xs text-gray-500">Record physical handover milestones and reason for delays.</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => setModalType('possession')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Possession Record</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Possession ID</th>
                  <th className="p-3">Survey &amp; Village</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Possession Date</th>
                  <th className="p-3">Pending Parcels</th>
                  <th className="p-3">Reason for Delay</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {possessionRecords.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0B3520]">{p.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{p.surveyNumber}</div>
                      <div className="text-[11px] text-gray-500">{p.village}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.possessionStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.possessionStatus === 'Disputed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.possessionStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-700">{p.possessionDate}</td>
                    <td className="p-3 font-mono font-bold text-gray-800">{p.pendingParcels}</td>
                    <td className="p-3 text-gray-700 truncate max-w-[200px]">{p.reasonForDelay}</td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Possession', p.id, setPossessionRecords)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 09. STAKEHOLDERS ---------------- */}
      {activeSection === 'stakeholders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#0B3520]" />
                <span>09. Stakeholder Consultations &amp; Grievances</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#0B3520]/10 text-[#0B3520]">
                  {stakeholders.length} Engagements
                </span>
              </h2>
              <p className="text-xs text-gray-500">Track inter-agency coordination, village meetings, and contractor issues.</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => setModalType('stakeholders')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Consultation Record</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Stakeholder Category</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3">Meeting Date</th>
                  <th className="p-3">Response Status</th>
                  <th className="p-3">Key Issue / Grievance</th>
                  <th className="p-3">Resolution Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stakeholders.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-semibold text-gray-900">{s.stakeholder}</td>
                    <td className="p-3 text-gray-800">{s.contactPerson}</td>
                    <td className="p-3 font-mono text-gray-600">{s.meetingDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          s.responseStatus === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.responseStatus === 'Objection Raised'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.responseStatus}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 truncate max-w-[180px]">{s.issue}</td>
                    <td className="p-3 text-gray-600 truncate max-w-[180px]">{s.resolution}</td>
                    <td className="p-3 text-right">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('Stakeholders', s.id, setStakeholders)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- MODALS FOR ADDING RECORDS ---------------- */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200">
            <div className="bg-[#0B3520] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold capitalize">Add Record — {modalType}</h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-white/80 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[80vh] overflow-y-auto">
              {/* Land Add Modal */}
              {modalType === 'land' && (
                <form onSubmit={handleAddLand} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Survey Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 152/3A"
                      value={newLand.surveyNumber}
                      onChange={(e) => setNewLand({ ...newLand, surveyNumber: e.target.value })}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Area</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLand.areaValue}
                        onChange={(e) => setNewLand({ ...newLand, areaValue: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Unit</label>
                      <select
                        value={newLand.areaUnit}
                        onChange={(e) => setNewLand({ ...newLand, areaUnit: e.target.value as any })}
                        className="w-full p-2 border rounded-xl"
                      >
                        <option value="Acres">Acres</option>
                        <option value="Hectares">Hectares</option>
                        <option value="Sq. Meters">Sq. Meters</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Land Type</label>
                    <select
                      value={newLand.landType}
                      onChange={(e) => setNewLand({ ...newLand, landType: e.target.value as any })}
                      className="w-full p-2 border rounded-xl"
                    >
                      <option value="Agricultural">Agricultural</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Government">Government</option>
                      <option value="Forest">Forest</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Owner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Smt. Kamala Devi"
                      value={newLand.ownerName}
                      onChange={(e) => setNewLand({ ...newLand, ownerName: e.target.value })}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-white bg-[#0B3520] font-bold"
                    >
                      Save Land Record
                    </button>
                  </div>
                </form>
              )}

              {/* Families Add Modal */}
              {modalType === 'families' && (
                <form onSubmit={handleAddFamily} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Head of Family *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shri P. Satyanarayana"
                      value={newFamily.headOfFamily}
                      onChange={(e) => setNewFamily({ ...newFamily, headOfFamily: e.target.value })}
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Associated Land Parcel ID</label>
                    <select
                      value={newFamily.associatedLandId}
                      onChange={(e) => setNewFamily({ ...newFamily, associatedLandId: e.target.value })}
                      className="w-full p-2 border rounded-xl"
                    >
                      {landRecords.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.id} — Survey {l.surveyNumber} ({l.ownerName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Family Members</label>
                      <input
                        type="number"
                        value={newFamily.familyMembersCount}
                        onChange={(e) => setNewFamily({ ...newFamily, familyMembersCount: parseInt(e.target.value, 10) || 1 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Compensation (₹)</label>
                      <input
                        type="number"
                        value={newFamily.compensationAmount}
                        onChange={(e) => setNewFamily({ ...newFamily, compensationAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-white bg-[#0B3520] font-bold"
                    >
                      Save Family Record
                    </button>
                  </div>
                </form>
              )}

              {/* Compensation Add Modal */}
              {modalType === 'compensation' && (
                <form onSubmit={handleAddCompensation} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Select Beneficiary Family</label>
                    <select
                      value={newComp.familyId}
                      onChange={(e) => {
                        const fam = families.find((f) => f.id === e.target.value);
                        setNewComp({
                          ...newComp,
                          familyId: e.target.value,
                          headOfFamily: fam?.headOfFamily || '',
                          landId: fam?.associatedLandId || '',
                          compensationAmount: fam?.compensationAmount || 1000000,
                        });
                      }}
                      className="w-full p-2 border rounded-xl"
                    >
                      {families.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.id} — {f.headOfFamily} (₹{f.compensationAmount.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Total Compensation (₹)</label>
                      <input
                        type="number"
                        value={newComp.compensationAmount}
                        onChange={(e) => setNewComp({ ...newComp, compensationAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Amount Paid (₹)</label>
                      <input
                        type="number"
                        value={newComp.amountPaid}
                        onChange={(e) => setNewComp({ ...newComp, amountPaid: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-gray-500 text-[11px]">Auto Calculated Pending:</div>
                    <div className="font-bold font-mono text-sm text-red-600">
                      ₹{Math.max(0, (newComp.compensationAmount || 0) - (newComp.amountPaid || 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-white bg-[#0B3520] font-bold"
                    >
                      Save Compensation
                    </button>
                  </div>
                </form>
              )}

              {/* Other Modals (Generic Simple Form) */}
              {(modalType === 'approvals' ||
                modalType === 'legal' ||
                modalType === 'rr' ||
                modalType === 'possession' ||
                modalType === 'stakeholders') && (
                <div className="space-y-3 text-xs">
                  <p className="text-gray-600">
                    Enter details for this {modalType} entry. The system validates all dates and relational constraints automatically.
                  </p>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        if (modalType === 'approvals') handleAddApproval(e);
                        else if (modalType === 'legal') handleAddLegal(e);
                        else if (modalType === 'rr') handleAddRr(e);
                        else if (modalType === 'possession') handleAddPossession(e);
                        else if (modalType === 'stakeholders') handleAddStakeholder(e);
                      }}
                      className="px-4 py-2 rounded-xl text-white bg-[#0B3520] font-bold"
                    >
                      Confirm &amp; Add Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
