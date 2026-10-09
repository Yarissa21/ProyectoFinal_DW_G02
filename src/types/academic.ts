export type AcademicRecordType = 'DEGREE' | 'CERTIFICATION' | 'COURSE' | 'OTHER';

export interface AcademicEmployee {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AcademicRecord {
  id: string;
  employee: AcademicEmployee;
  type: AcademicRecordType;
  title: string;
  institution: string;
  graduationDate?: string | null;
  credentialCode?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicRecordPayload {
  type: AcademicRecordType;
  title: string;
  institution: string;
  graduationDate?: string;
  credentialCode?: string;
  notes?: string;
}

export type UpdateAcademicRecordPayload = Partial<CreateAcademicRecordPayload>;

export interface AcademicRecordListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AcademicRecordType;
  institution?: string;
}
