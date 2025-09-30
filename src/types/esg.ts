export interface Company {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastUpdated: string;
}

export interface ESGRiskFactor {
  category: 'Environmental' | 'Social' | 'Governance';
  factor: string;
  impact: number;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ESGAnalysis {
  company: Company;
  riskFactors: ESGRiskFactor[];
  industryBenchmark: number;
  trend: number[];
  textualInsights: string[];
}