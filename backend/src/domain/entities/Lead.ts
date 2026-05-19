export type LeadStatus = "new" | "in_progress" | "done" | "spam";

export interface Lead {
  id: string;
  formId: string;
  name: string;
  phone: string | null;
  email: string | null;
  contact: string | null;
  service: string | null;
  message: string | null;
  pageUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadInput {
  formId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  contact?: string | null;
  service?: string | null;
  message?: string | null;
  pageUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}
