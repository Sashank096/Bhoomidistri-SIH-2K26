import { ValidationCheck, ValidationIssue, ValidationSummaryResult, ProjectDataAuditLog } from '../types';

export const INITIAL_VALIDATION_CHECKS: ValidationCheck[] = [
  {
    id: 'chk-01',
    errorCode: 'VAL-001',
    name: 'Missing Required Fields',
    description: 'Missing required mandatory fields in cadastral records or family profiles',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Required-field validation',
  },
  {
    id: 'chk-02',
    errorCode: 'VAL-002',
    name: 'Invalid Values & Range Limits',
    description: 'Values outside acceptable physical range (e.g. Area <= 0, Compensation < 0)',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Range validation',
  },
  {
    id: 'chk-03',
    errorCode: 'VAL-003',
    name: 'Missing Statutory Documents',
    description: 'Mandatory Section 4/11 or 19/6 notifications not uploaded or unverified',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Document validation',
  },
  {
    id: 'chk-04',
    errorCode: 'VAL-004',
    name: 'Duplicate Records',
    description: 'Duplicate survey numbers, Khasra IDs, or Aadhaar identity hashes',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Duplicate validation',
  },
  {
    id: 'chk-05',
    errorCode: 'VAL-005',
    name: 'Cross-Field Data Consistency',
    description: 'Relational consistency between Land Parcel IDs, Family IDs, and Payment records',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Logical consistency validation',
  },
  {
    id: 'chk-06',
    errorCode: 'VAL-006',
    name: 'Date Sequence & Chronology Validation',
    description: 'Chronological inconsistency (e.g. possession date preceding section 4 notification)',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Logical consistency validation',
  },
  {
    id: 'chk-07',
    errorCode: 'VAL-007',
    name: 'Cadastral Reference Integrity',
    description: 'Invalid reference to state DoLR land repository database or unmapped village codes',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Reference integrity',
  },
  {
    id: 'chk-08',
    errorCode: 'VAL-008',
    name: 'Data Format & Syntax Validation',
    description: 'Incorrect data format in phone numbers, PIN codes, or geo-coordinate strings',
    status: 'PASSED',
    recordsAffected: 0,
    category: 'Data-type validation',
  },
];

export const INITIAL_VALIDATION_ISSUES: ValidationIssue[] = [];

export const INITIAL_VALIDATION_RESULT: ValidationSummaryResult = {
  projectId: '',
  projectName: 'No Project Selected',
  location: 'N/A',
  validatedOn: 'Pending Data Validation',
  totalRecords: 0,
  validRecords: 0,
  errorsCount: 0,
  warningsCount: 0,
  mlReady: true,
  checks: INITIAL_VALIDATION_CHECKS,
  issues: INITIAL_VALIDATION_ISSUES,
};

export const INITIAL_VALIDATION_AUDIT_TRAIL: ProjectDataAuditLog[] = [];
