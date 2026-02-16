export type EmailMode = 
  | 'existing_myca_member'
  | 'new_myca_member'
  | 'event_outreach'
  | 'person_of_interest'
  | 'brand_of_interest';

export type EmailTag = 
  | 'MYCA-EXISTING'
  | 'MYCA-NEW'
  | 'EVENT'
  | 'POI'
  | 'BRAND'
  | 'UNVERIFIED';

export interface LookupResult {
  name: string;
  title: string;
  company: string;
  source: string;
}

export interface DraftResponse {
  subject: string;
  to: string;
  mode: EmailMode;
  tag: EmailTag;
  body: string;
}

export interface AgentResponse {
  type: 'draft' | 'lookup_needed' | 'questions';
  data?: DraftResponse;
  lookup_needed?: {
    role: string;
    company: string;
  };
  questions?: string[];
  lookup_results?: LookupResult[];
}

export interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  user_email: string;
}


