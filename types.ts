
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface BrandCI {
  id: string;
  name: string;
  brandStory: string; // 品牌故事
  mission: string;    // 品牌使命/識別
  primaryColor: string;
  secondaryColor: string;
  fontStyle: string;
  styleGuidelines: string; // 風格指南
  tone: string;
  persona: string;
  targetAudience: string; 
  logoDescription: string;
  additionalRules: string;
  ctaStrategy: string;
  updatedAt?: number;
  history?: BrandCIHistoryItem[];
}

export interface BrandCIHistoryItem {
  timestamp: number;
  data: Omit<BrandCI, 'history'>;
}

export interface AuditMetric {
  score: number;
  status: 'Pass' | 'Caution' | 'Fail';
  feedback: string;
}

export interface AuditResult {
  overallScore: number;
  creativeEnergy: number; 
  visualImpact: number;   
  healthStatus: 'Excellent' | 'On-Brand' | 'Divergent' | 'Off-Brand';
  metrics: {
    colors: AuditMetric;
    typography: AuditMetric;
    logo: AuditMetric;
    composition: AuditMetric;
  };
  marketingCritique: string;
  creativeCritique: string; 
  suggestions: {
    compliance: string[];
    creative: string[];
  };
  freedomAssessment: string;
}

export interface Asset {
  id: string;
  groupId: string;
  version: number;
  url: string;
  name: string;
  intent?: string;
  campaignContext?: string;
  timestamp: number;
  auditResult?: AuditResult;
  ciSnapshot?: Omit<BrandCI, 'history'>;
}
