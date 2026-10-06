export type AuthStep = 'login' | 'authenticating' | 'mfa' | 'mfa_verifying' | 'authenticated' | 'forgot_password';

export type UserRole = 'Administrator' | 'Officer' | 'Viewer' | 'Landowner';

export interface AdminUser {
  officialId: string;
  fullName: string;
  designation: string;
  department: string;
  ministry: string;
  securityClearance: 'Level-3 (Restricted)' | 'Level-4 (Confidential)' | 'Level-5 (Top Secret GIS)';
  zone: string;
  lastLogin: string;
  ipAddress: string;
  activeSessionId: string;
  role?: UserRole;
}

export interface LoginFormState {
  officialId: string;
  password: string;
  captchaInput: string;
  rememberDevice: boolean;
}

export interface MfaState {
  otp: string[];
  mfaMethod: 'sms_email' | 'nic_token' | 'totp';
  timeLeft: number;
  attemptsLeft: number;
  resendCooldown: boolean;
}

export interface SecurityAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

export type ProjectStatus = 'Active' | 'Planning' | 'Under Review' | 'Delayed' | 'Completed' | 'Archived' | 'Draft';

export type ProjectRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectType =
  | 'Highway'
  | 'Railway'
  | 'Irrigation'
  | 'Industrial Corridor'
  | 'Urban Development'
  | 'Rural Connectivity'
  | 'Infrastructure'
  | 'Other';

export interface ProjectRecord {
  id: string; // e.g. PRJ-1042
  name: string; // e.g. NH-216 Land Acquisition
  projectType: ProjectType;
  state: string; // e.g. Andhra Pradesh
  district: string; // e.g. East Godavari
  location: string; // e.g. Kakinada to Kathipudi Alignment
  department: string; // e.g. National Highway Authority of India
  startDate: string; // YYYY-MM-DD
  targetCompletionDate: string; // YYYY-MM-DD
  description: string;
  status: ProjectStatus;
  riskLevel: ProjectRiskLevel;
  delayProbability: number; // 0 - 100%
  delayDays: number;
  totalParcels: number;
  acquiredParcels: number;
  disputedParcels: number;
  budgetCr: number;
  totalLandAreaHa?: number;
  numberOfVillages?: number;
  initialAffectedFamilies?: number;
  priority?: 'High' | 'Medium' | 'Standard';
  assignedOfficer: string; // e.g. Officer 102 (Dr. Rajeshwar Sharma)
  officerId: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  archivedAt?: string | null;
  stage: string; // e.g. Compensation, R&R, Planning
  gisCoordinates?: {
    lat: number;
    lng: number;
    bbox?: string;
  };
}

export interface ProjectAuditRecord {
  id: string;
  user: string;
  role: string;
  action: 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'PROJECT_ARCHIVED' | 'PROJECT_VIEWED' | 'PROJECT_LOCATION_UPDATED' | 'PROJECT_STATUS_UPDATED';
  projectId: string;
  projectName: string;
  timestamp: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: string;
}

export interface ProjectFilterState {
  searchQuery: string;
  state: string;
  district: string;
  status: string;
  riskLevel: string;
  projectType: string;
  officer: string;
}

export interface ProjectFormData {
  name: string;
  projectId: string;
  projectType: ProjectType;
  state: string;
  district: string;
  location: string;
  department: string;
  startDate: string;
  targetCompletionDate: string;
  description: string;
  estimatedCostCr: string;
  totalLandAreaHa: string;
  numberOfVillages: string;
  initialAffectedFamilies: string;
  priority: 'High' | 'Medium' | 'Standard';
  assignedOfficer: string;
  gisCoordinates?: {
    lat: number;
    lng: number;
    bbox?: string;
  };
}

export type DataSectionId =
  | 'land'
  | 'families'
  | 'compensation'
  | 'approvals'
  | 'legal'
  | 'documents'
  | 'rr'
  | 'possession'
  | 'stakeholders';

export type SectionCompletionStatus = 'completed' | 'in_progress' | 'not_started' | 'requires_attention';

export type DataValidationStatus = 'DRAFT' | 'VALIDATION_REQUIRED' | 'VALIDATED' | 'READY_FOR_PREDICTION' | 'REJECTED';

export type DataEntryMode = 'manual' | 'upload';

export interface LandRecordItem {
  id: string; // e.g. LND-001
  surveyNumber: string; // e.g. 124/2A
  khasraNumber?: string;
  areaValue: number;
  areaUnit: 'Acres' | 'Hectares' | 'Sq. Meters';
  landType: 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Government' | 'Forest' | 'Other';
  ownership: 'Private' | 'Government' | 'Joint' | 'Community' | 'Other';
  ownerName: string;
  village: string;
  acquisitionStatus: 'Not Started' | 'Notice Issued' | 'Under Process' | 'Compensation Pending' | 'Acquired' | 'Possession Taken' | 'Disputed';
  estimatedCompensation?: number;
  remarks?: string;
}

export interface AffectedFamilyItem {
  id: string; // e.g. FAM-001
  headOfFamily: string;
  associatedLandId: string; // references LandRecordItem.id
  surveyNumber?: string;
  landArea: string;
  familyMembersCount: number;
  compensationAmount: number;
  paymentStatus: 'Pending' | 'Partial' | 'Disbursed';
  rrEligibility: 'Eligible' | 'Not Eligible' | 'Under Review';
  contactNo?: string;
  bankAccountLinked?: boolean;
}

export interface CompensationItem {
  id: string; // e.g. CMP-001
  familyId: string; // references AffectedFamilyItem.id
  landId: string; // references LandRecordItem.id
  headOfFamily: string;
  compensationAmount: number;
  amountPaid: number;
  amountPending: number; // Auto: compensationAmount - amountPaid
  paymentDate: string;
  paymentStatus: 'Pending' | 'Partial' | 'Completed' | 'Disputed';
  paymentMode?: string;
  awardNoticeDate?: string;
}

export interface ApprovalItem {
  id: string; // e.g. APP-001
  approvalType: string;
  issuingAuthority: string;
  requiredDate: string;
  actualDate: string;
  status: 'Pending' | 'Under Review' | 'Completed' | 'Delayed';
  delayDays: number; // Auto: max(0, actualDate - requiredDate in days)
  remarks?: string;
}

export interface LegalDisputeItem {
  id: string; // e.g. CAS-402
  caseType: string;
  courtAuthority: string;
  filingDate: string;
  petitioner: string;
  currentStatus: 'Filed' | 'Under Review' | 'Hearing Scheduled' | 'Pending Decision' | 'Resolved' | 'Closed';
  expectedResolution: string;
  nextHearingDate?: string;
  stayOrderActive?: boolean;
  summary?: string;
}

export interface DocumentItem {
  id: string; // e.g. DOC-001
  name: string;
  category: string;
  isRequired: boolean;
  isUploaded: boolean;
  verificationStatus: 'Verified' | 'Pending' | 'Missing' | 'Rejected';
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  expiryDate?: string;
  verifiedBy?: string;
}

export interface RrItem {
  id: string; // e.g. RR-001
  familyId: string;
  headOfFamily: string;
  eligibility: 'Eligible' | 'Not Eligible' | 'Under Review';
  rrPackage: string;
  progress: number; // 0 - 100
  status: 'Not Started' | 'In Progress' | 'Completed';
  allocatedSite?: string;
  subsistenceAllowancePaid?: boolean;
}

export interface PossessionItem {
  id: string; // e.g. POS-001
  landId: string;
  surveyNumber: string;
  village: string;
  possessionStatus: 'Not Started' | 'Partially Completed' | 'Completed' | 'Blocked' | 'Disputed';
  possessionDate: string;
  pendingParcels: number;
  reasonForDelay: string;
  jointSurveyConducted: boolean;
  physicalHandoverToAgency?: string;
}

export interface StakeholderItem {
  id: string; // e.g. STK-001
  stakeholder: string;
  contactPerson: string;
  responseStatus: 'Accepted' | 'Pending' | 'Objection Raised' | 'Meeting Scheduled';
  meetingDate: string;
  issue: string;
  resolution: string;
}

export interface ProjectDataAuditLog {
  id: string;
  user: string;
  action:
    | 'DATA_CREATED'
    | 'DATA_UPDATED'
    | 'DATA_UPLOADED'
    | 'DATA_IMPORTED'
    | 'DATA_VALIDATION_SUBMITTED'
    | 'VALIDATION_STARTED'
    | 'VALIDATION_COMPLETED'
    | 'VALIDATION_ERROR_RESOLVED'
    | 'WARNING_IGNORED'
    | 'DATA_CORRECTED'
    | 'VALIDATION_RETRIED'
    | 'ML_PIPELINE_UNLOCKED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_VERIFIED'
    | 'DATA_DELETED';
  projectId: string;
  dataset: string;
  rowsAffected?: number;
  timestamp: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: string;
}

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'CRITICAL' | 'PASSED';
export type ValidationCheckStatus = 'PASSED' | 'WARNING' | 'FAILED';

export interface ValidationCheck {
  id: string;
  name: string;
  description: string;
  status: ValidationCheckStatus;
  recordsAffected: number;
  errorCode: string;
  category: string;
}

export interface ValidationIssue {
  id: string;
  errorCode: string;
  severity: 'ERROR' | 'WARNING' | 'CRITICAL';
  issueDescription: string;
  dataset: DataSectionId | string;
  datasetLabel: string;
  recordsAffected: number;
  affectedRecordIds: string[];
  firstOccurrence: string;
  field: string;
  detailedExplanation: string;
  status: 'Open' | 'Resolved' | 'Ignored';
  ignoredBy?: string;
  ignoredAt?: string;
  ignoredReason?: string;
}

export interface ValidationSummaryResult {
  projectId: string;
  projectName: string;
  location: string;
  validatedOn: string;
  totalRecords: number;
  validRecords: number;
  errorsCount: number;
  warningsCount: number;
  mlReady: boolean;
  checks: ValidationCheck[];
  issues: ValidationIssue[];
}

export type ProjectPredictionStatus =
  | 'NOT_GENERATED'
  | 'GENERATING'
  | 'AVAILABLE'
  | 'OUTDATED'
  | 'FAILED'
  | 'BLOCKED';

export type StageName =
  | 'Notification'
  | 'Verification'
  | 'Approval'
  | 'Compensation'
  | 'Legal'
  | 'R&R'
  | 'Possession';

export interface StagePredictionItem {
  stage: StageName;
  stageNumber: number; // 1 to 7
  stageCode: string; // e.g. STG-01
  delayProbability: number; // 0 - 100%
  riskScore: number; // 0.00 - 1.00
  expectedDelayMonths: number; // e.g. 2.4
  expectedDelayDays: number; // e.g. 72
  riskLevel: ProjectRiskLevel; // LOW | MEDIUM | HIGH | CRITICAL
  status: string; // e.g. 'Critical Delay', 'Moderate Risk', 'On Track', 'Pending Action'
  keyRiskFactors: string[];
  mitigationAction: string;
  completionRatePercent?: number;
  confidenceScore?: number;
}

export interface PredictionMetadata {
  modelVersion: string;
  modelType: string;
  predictionId: string;
  datasetVersion: string;
  dataSnapshotTimestamp: string;
  predictionTimestamp: string;
  featureSetVersion: string;
  algorithm: string;
  trainingDataScope: string;
  accuracyScore: number;
  aucRoc: number;
  confidenceInterval: string;
}

export interface MlPredictionOverall {
  delayProbability: number; // e.g. 72.4%
  riskScore: number; // e.g. 0.72
  expectedDelayMonths: number; // e.g. 6.4 months
  expectedDelayDays: number; // e.g. 192 days
  confidence: number; // e.g. 88.5%
  riskLevel: ProjectRiskLevel; // LOW | MEDIUM | HIGH | CRITICAL
  modelConfidenceGrade: 'Very High' | 'High' | 'Moderate' | 'Low';
  overallStatus: string;
}

export interface MlPredictionResult {
  projectId: string;
  projectName: string;
  location: string;
  status: ProjectPredictionStatus;
  overall: MlPredictionOverall;
  stages: StagePredictionItem[];
  summaryExplanation: string;
  topRiskContributors: Array<{
    factor: string;
    stage: StageName;
    impactPercentage: number;
    description: string;
  }>;
  metadata: PredictionMetadata;
  isDataFresh: boolean;
  dataChangesSincePrediction: number;
}

export interface PredictionHistoryItem {
  id: string;
  projectId: string;
  generatedAt: string;
  modelVersion: string;
  datasetVersion: string;
  riskLevel: ProjectRiskLevel;
  delayProbability: number;
  expectedDelayMonths: number;
  status: 'AVAILABLE' | 'SUPERSEDED' | 'FAILED';
  triggeredBy: string;
  remarks: string;
}

