import {
  AffectedFamilyItem,
  ApprovalItem,
  CompensationItem,
  LandRecordItem,
  LegalDisputeItem,
  PossessionItem,
  RrItem,
  StakeholderItem,
  ValidationIssue,
  ValidationSummaryResult,
} from '../types';

export interface ProjectDataSnapshot {
  landRecords: LandRecordItem[];
  families: AffectedFamilyItem[];
  compensationRecords: CompensationItem[];
  approvals: ApprovalItem[];
  legalDisputes: LegalDisputeItem[];
  rrRecords: RrItem[];
  possessionRecords: PossessionItem[];
  stakeholders: StakeholderItem[];
}

const issue = (
  id: string,
  errorCode: string,
  severity: ValidationIssue['severity'],
  dataset: ValidationIssue['dataset'],
  datasetLabel: string,
  field: string,
  message: string,
  affectedRecordIds: string[],
  recordsAffected: number
): ValidationIssue => ({
  id,
  errorCode,
  severity,
  issueDescription: message,
  dataset,
  datasetLabel,
  recordsAffected,
  affectedRecordIds,
  firstOccurrence: new Date().toISOString(),
  field,
  detailedExplanation: message,
  status: 'Open',
});

export function validateProjectDataIntegrity(snapshot: ProjectDataSnapshot): ValidationSummaryResult {
  const landIds = new Set(snapshot.landRecords.map((record) => record.id));
  const familyIds = new Set(snapshot.families.map((record) => record.id));

  const issues: ValidationIssue[] = [];

  const invalidFamilyReferences = snapshot.families.filter((family) => !landIds.has(family.associatedLandId));
  if (invalidFamilyReferences.length > 0) {
    issues.push(
      issue(
        'V-REF-001',
        'REF-001',
        'ERROR',
        'families',
        'Affected Families',
        'associatedLandId',
        'Affected family records must reference an existing land parcel.',
        invalidFamilyReferences.map((family) => family.id),
        invalidFamilyReferences.length
      )
    );
  }

  const invalidCompensationLandRefs = snapshot.compensationRecords.filter((record) => !landIds.has(record.landId));
  if (invalidCompensationLandRefs.length > 0) {
    issues.push(
      issue(
        'V-REF-002',
        'REF-002',
        'ERROR',
        'compensation',
        'Compensation',
        'landId',
        'Compensation records must reference an existing land parcel.',
        invalidCompensationLandRefs.map((record) => record.id),
        invalidCompensationLandRefs.length
      )
    );
  }

  const invalidCompensationFamilyRefs = snapshot.compensationRecords.filter((record) => !familyIds.has(record.familyId));
  if (invalidCompensationFamilyRefs.length > 0) {
    issues.push(
      issue(
        'V-REF-003',
        'REF-003',
        'ERROR',
        'compensation',
        'Compensation',
        'familyId',
        'Compensation records must reference an existing affected family.',
        invalidCompensationFamilyRefs.map((record) => record.id),
        invalidCompensationFamilyRefs.length
      )
    );
  }

  const rrFamilyRefs = snapshot.rrRecords.filter((record) => !familyIds.has(record.familyId));
  if (rrFamilyRefs.length > 0) {
    issues.push(
      issue(
        'V-REF-004',
        'REF-004',
        'WARNING',
        'rr',
        'R&R',
        'familyId',
        'R&R entries should reference an existing affected family.',
        rrFamilyRefs.map((record) => record.id),
        rrFamilyRefs.length
      )
    );
  }

  const possessionLandRefs = snapshot.possessionRecords.filter((record) => !landIds.has(record.landId));
  if (possessionLandRefs.length > 0) {
    issues.push(
      issue(
        'V-REF-005',
        'REF-005',
        'WARNING',
        'possession',
        'Possession',
        'landId',
        'Possession records should reference an existing land parcel.',
        possessionLandRefs.map((record) => record.id),
        possessionLandRefs.length
      )
    );
  }

  const totalRecords =
    snapshot.landRecords.length +
    snapshot.families.length +
    snapshot.compensationRecords.length +
    snapshot.approvals.length +
    snapshot.legalDisputes.length +
    snapshot.rrRecords.length +
    snapshot.possessionRecords.length +
    snapshot.stakeholders.length;

  const errorCount = issues.filter((entry) => entry.severity === 'ERROR' || entry.severity === 'CRITICAL').length;
  const warningCount = issues.filter((entry) => entry.severity === 'WARNING').length;

  return {
    projectId: 'PRJ-1042',
    projectName: 'BhoomiDrishti Seed Data',
    location: 'Seeded project data',
    validatedOn: new Date().toISOString(),
    totalRecords,
    validRecords: totalRecords - errorCount - warningCount,
    errorsCount: errorCount,
    warningsCount: warningCount,
    mlReady: errorCount === 0,
    checks: [],
    issues,
  };
}
