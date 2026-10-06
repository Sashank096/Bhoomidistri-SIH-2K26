import {
  LandRecordItem,
  AffectedFamilyItem,
  CompensationItem,
  ApprovalItem,
  LegalDisputeItem,
  DocumentItem,
  RrItem,
  PossessionItem,
  StakeholderItem,
  ProjectDataAuditLog,
} from '../types';

export const INITIAL_LAND_RECORDS: LandRecordItem[] = [];

export const INITIAL_AFFECTED_FAMILIES: AffectedFamilyItem[] = [];

export const INITIAL_COMPENSATION_RECORDS: CompensationItem[] = [];

export const INITIAL_APPROVALS_RECORDS: ApprovalItem[] = [];

export const INITIAL_LEGAL_DISPUTES: LegalDisputeItem[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_RR_RECORDS: RrItem[] = [];

export const INITIAL_POSSESSION_RECORDS: PossessionItem[] = [];

export const INITIAL_STAKEHOLDERS: StakeholderItem[] = [];

export const INITIAL_DATA_AUDIT_LOGS: ProjectDataAuditLog[] = [];

export const SAMPLE_CSV_TEMPLATES: Record<string, string> = {
  land: `survey_number,khasra_number,area_value,area_unit,land_type,ownership,owner_name,village,acquisition_status,estimated_compensation
148/1A,K-192,3.2,Acres,Agricultural,Private,P. Satyanarayana,Kathipudi,Under Process,1120000
149/2B,K-195,1.4,Acres,Residential,Private,M. Venkatesh,Kathipudi,Notice Issued,980000
150/1,K-201,2.8,Acres,Agricultural,Joint,K. Subba Rao & Others,Kathipudi,Under Process,890000`,
  families: `family_id,head_of_family,associated_land_id,land_area,family_members_count,compensation_amount,payment_status,rr_eligibility,contact_no
FAM-001,P. Satyanarayana,LND-001,3.2 acres,5,1120000,Pending,Eligible,+91 98480 11223
FAM-002,M. Venkatesh,LND-002,1.4 acres,4,980000,Pending,Eligible,+91 94401 99887`,
  compensation: `family_id,land_id,head_of_family,compensation_amount,amount_paid,payment_date,payment_status,payment_mode
FAM-001,LND-001,P. Satyanarayana,1000000,750000,2026-07-15,Partial,DBT - PFMS
FAM-002,LND-002,M. Venkatesh,1200000,0,,Pending,DBT Escrow`,
  approvals: `approval_type,issuing_authority,required_date,actual_date,status,remarks
Explosive Storage Sanction,PESO Nagpur,2026-09-01,2026-08-25,Completed,Site inspection cleared
Groundwater NOC,State CGWA Authority,2026-08-15,,Pending,Submitted via single window`,
  legal: `case_type,court_authority,filing_date,petitioner,current_status,expected_resolution,summary
Tree Valuation Grievance,Land Acquisition Tribunal,2026-04-10,Coconut Farmers Union,Hearing Scheduled,2026-10-05,Requesting recalculation of coconut tree yielding capacity`,
  documents: `name,category,is_required,file_name,verification_status
Tree Compensation Matrix,Revenue Record,Yes,Tree_Valuation_Matrix_Aug2026.pdf,Verified`,
  rr: `family_id,head_of_family,eligibility,rr_package,progress,status,allocated_site
FAM-001,Ramesh Kumar,Eligible,Residential Plot + Livelihood Grant,65,In Progress,Annavaram Plot 42`,
  possession: `survey_number,village,possession_status,possession_date,pending_parcels,reason_for_delay
152/1,Kathipudi,Partially Completed,2026-08-20,6,Tree harvest pending`,
  stakeholders: `stakeholder,contact_person,response_status,meeting_date,issue,resolution
Grama Panchayat,Sarpanch - Kathipudi,Accepted,2026-08-24,Common grazing land compensation,Community hall sanctioned`,
};
