export type OpportunityType = 'job' | 'remote' | 'freelance' | 'gig' | 'internship' | 'training' | 'scholarship' | 'artisan';

export type VerificationStatus = 'verified' | 'unverified' | 'flagged';

export interface OpportunitySummary {
  id: string;
  title: string;
  type: OpportunityType;
  matchScore: number;
  verification: VerificationStatus;
  location?: string;
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
  database: 'ok' | 'error';
}
