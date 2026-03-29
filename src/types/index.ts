// Dataverse Entity Types
export interface DataverseEntity {
  '@odata.etag'?: string;
  [key: string]: unknown;
}

export interface Account extends DataverseEntity {
  accountid: string;
  name: string;
  emailaddress1?: string;
  telephone1?: string;
  address1_city?: string;
  revenue?: number;
  createdon: string;
  modifiedon: string;
}

export interface Contact extends DataverseEntity {
  contactid: string;
  fullname: string;
  firstname?: string;
  lastname?: string;
  emailaddress1?: string;
  telephone1?: string;
  jobtitle?: string;
  _parentcustomerid_value?: string;
}

export interface Opportunity extends DataverseEntity {
  opportunityid: string;
  name: string;
  estimatedvalue?: number;
  estimatedclosedate?: string;
  statecode: number;
  statuscode: number;
  _parentaccountid_value?: string;
  _parentcontactid_value?: string;
}

// Analytics Types
export interface DashboardMetrics {
  totalAccounts: number;
  totalContacts: number;
  totalOpportunities: number;
  totalRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  opportunitiesByStage: { stage: string; count: number; value: number }[];
  topAccounts: { name: string; revenue: number }[];
}

export interface Report {
  _id: string;
  title: string;
  description: string;
  type: 'sales' | 'accounts' | 'opportunities' | 'custom';
  filters: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DataverseResponse<T> {
  '@odata.context': string;
  '@odata.count'?: number;
  value: T[];
}
