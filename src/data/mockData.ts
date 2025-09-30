import { Company, ESGRiskFactor, ESGAnalysis } from '@/types/esg';

export const mockCompanies: Company[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    marketCap: 2800000,
    esgScore: 78,
    environmentalScore: 82,
    socialScore: 75,
    governanceScore: 77,
    riskLevel: 'Low',
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    marketCap: 450000,
    esgScore: 34,
    environmentalScore: 22,
    socialScore: 41,
    governanceScore: 39,
    riskLevel: 'High',
    lastUpdated: '2024-01-15'
  },
  {
    id: '3',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Automotive',
    marketCap: 800000,
    esgScore: 65,
    environmentalScore: 88,
    socialScore: 52,
    governanceScore: 55,
    riskLevel: 'Medium',
    lastUpdated: '2024-01-15'
  },
  {
    id: '4',
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Financial Services',
    marketCap: 550000,
    esgScore: 71,
    environmentalScore: 68,
    socialScore: 73,
    governanceScore: 72,
    riskLevel: 'Medium',
    lastUpdated: '2024-01-15'
  },
  {
    id: '5',
    symbol: 'PG',
    name: 'The Procter & Gamble Company',
    sector: 'Consumer Goods',
    marketCap: 380000,
    esgScore: 84,
    environmentalScore: 79,
    socialScore: 87,
    governanceScore: 86,
    riskLevel: 'Low',
    lastUpdated: '2024-01-15'
  }
];

export const mockRiskFactors: { [key: string]: ESGRiskFactor[] } = {
  'AAPL': [
    {
      category: 'Environmental',
      factor: 'Supply Chain Carbon Footprint',
      impact: 0.72,
      description: 'Manufacturing partners in high-emission regions',
      sentiment: 'negative'
    },
    {
      category: 'Social',
      factor: 'Labor Practices in Supply Chain',
      impact: 0.58,
      description: 'Ongoing monitoring of supplier working conditions',
      sentiment: 'neutral'
    },
    {
      category: 'Governance',
      factor: 'Board Diversity',
      impact: 0.82,
      description: 'Strong representation across demographics',
      sentiment: 'positive'
    }
  ],
  'XOM': [
    {
      category: 'Environmental',
      factor: 'Carbon Emissions',
      impact: 0.91,
      description: 'Significant scope 1 and 2 emissions from operations',
      sentiment: 'negative'
    },
    {
      category: 'Environmental',
      factor: 'Climate Risk Exposure',
      impact: 0.88,
      description: 'High exposure to transition and physical climate risks',
      sentiment: 'negative'
    },
    {
      category: 'Social',
      factor: 'Community Relations',
      impact: 0.65,
      description: 'Mixed stakeholder engagement in operational areas',
      sentiment: 'neutral'
    }
  ]
};

export const mockAnalysis: { [key: string]: ESGAnalysis } = {
  'AAPL': {
    company: mockCompanies[0],
    riskFactors: mockRiskFactors['AAPL'],
    industryBenchmark: 72,
    trend: [74, 76, 75, 77, 78],
    textualInsights: [
      'Strong governance practices with diverse board composition',
      'Commitment to carbon neutrality by 2030 shows environmental leadership',
      'Supply chain labor monitoring requires continued attention'
    ]
  }
};