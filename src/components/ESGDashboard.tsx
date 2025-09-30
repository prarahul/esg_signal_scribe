import { useState, useEffect, useMemo } from 'react';
import { ESGPredictionForm } from './ESGPredictionForm';
import { ESGPredictionUpload } from './ESGPredictionUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySearch } from './CompanySearch';
import { ESGScoreCard } from './ESGScoreCard';
import { RiskFactorAnalysis } from './RiskFactorAnalysis';
import { Company } from '@/types/esg';
import { mockCompanies, mockRiskFactors, mockAnalysis } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { apiFetch } from '@/lib/api';



export function ESGDashboard() {
  const [selectedCompany, setSelectedCompany] = useState<Company>(mockCompanies[0]);
  const [singleResult, setSingleResult] = useState<any | null>(null);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);

  // New: backend-driven state
  const [companyInfo, setCompanyInfo] = useState<any | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [industryComparison, setIndustryComparison] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Helper to map score to risk level bands
  const riskLevelFromScore = (score: number | null | undefined): 'Low' | 'Medium' | 'High' | 'Critical' => {
    const s = Number(score ?? 0);
    if (s >= 75) return 'Low';
    if (s >= 50) return 'Medium';
    if (s >= 25) return 'High';
    return 'Critical';
  };

  useEffect(() => {
    // On mount, fetch for default company
    fetchCompanyData(selectedCompany.name);
    // eslint-disable-next-line
  }, []);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    fetchCompanyData(company.name);
  };

  function fetchCompanyData(companyName: string) {
    setLoadingCompany(true);
    apiFetch(`/company-esg-info?company=${encodeURIComponent(companyName)}`)
      .then(res => res.json())
      .then(data => {
        setCompanyInfo(data.company || null);
        setTrendData(
          (data.trend || [])
            .slice()
            .sort((a: any, b: any) => (Number(a?.year ?? 0) - Number(b?.year ?? 0)))
            .map((d: any, i: number) => ({
              month: d?.year ? String(d.year) : `Point ${i + 1}`,
              scoreActual: d?.actual_esg_score ?? null,
              scorePredicted: d?.predicted_esg_score ?? null,
            }))
        );
        setIndustryComparison(
          (data.industryComparison || []).map((d: any) => ({
            name: d.company,
            Environmental: d.environmental_score,
            Social: d.social_score,
            Governance: d.governance_score,
            // Use actual first, then fallback to predicted for overall benchmark
            Overall: d.actual_esg_score ?? d.predicted_esg_score ?? null,
          }))
        );
      })
      .finally(() => setLoadingCompany(false));
  }

  // Normalize backend company info to the frontend Company shape; fallback to mock if backend fails
  const scoreCardCompany: Company = (() => {
    if (!companyInfo) return selectedCompany;
    // Try esg_score -> actual -> predicted; if missing, average the three components if available
    let baseScore: number | undefined = companyInfo.esg_score ?? companyInfo.actual_esg_score ?? companyInfo.predicted_esg_score;
    if (baseScore == null) {
      const parts = [companyInfo.environmental_score, companyInfo.social_score, companyInfo.governance_score]
        .map((v: any) => (typeof v === 'number' && !isNaN(v) ? v : null))
        .filter((v: number | null) => v != null) as number[];
      if (parts.length === 3) baseScore = Math.round((parts[0] + parts[1] + parts[2]) / 3);
    }
    const esgScore = Math.round(
      baseScore ?? selectedCompany.esgScore ?? 0
    );
    return {
      id: selectedCompany?.id ?? 'n/a',
      symbol: companyInfo.symbol ?? companyInfo.company ?? selectedCompany.symbol,
      name: companyInfo.company ?? companyInfo.name ?? selectedCompany.name,
      sector: companyInfo.industry ?? companyInfo.sector ?? selectedCompany.sector ?? '',
      marketCap: Number(selectedCompany?.marketCap ?? 0),
      esgScore,
      environmentalScore: Math.round(companyInfo.environmental_score ?? selectedCompany.environmentalScore ?? 0),
      socialScore: Math.round(companyInfo.social_score ?? selectedCompany.socialScore ?? 0),
      governanceScore: Math.round(companyInfo.governance_score ?? selectedCompany.governanceScore ?? 0),
      riskLevel: riskLevelFromScore(esgScore),
      lastUpdated: new Date().toISOString(),
    };
  })();

  // Compute industry benchmark excluding null/undefined values
  const industryBenchmarkValue: number = (() => {
    const nums = industryComparison
      .map((d: any) => d?.Overall)
      .filter((v: any) => typeof v === 'number' && !isNaN(v)) as number[];
    return nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 65;
  })();
  const comparisonData = industryComparison.length > 0 ? industryComparison : mockCompanies.map(company => ({
    name: company.symbol,
    Environmental: company.environmentalScore,
    Social: company.socialScore,
    Governance: company.governanceScore,
    Overall: company.esgScore
  }));

  // Per-company metrics derived from trendData (Actual vs Predicted)
  const companyMetrics = useMemo(() => {
    const pairs = trendData.filter((d: any) => typeof d?.scoreActual === 'number' && typeof d?.scorePredicted === 'number');
    if (pairs.length === 0) return { latest: null as any, mae: null as number | null, rmse: null as number | null };
    const latest = pairs[pairs.length - 1];
    const errors = pairs.map((d: any) => (Number(d.scorePredicted) - Number(d.scoreActual)));
    const absErrors = errors.map((e: number) => Math.abs(e));
    const mae = absErrors.reduce((a: number, b: number) => a + b, 0) / absErrors.length;
    const mse = errors.reduce((a: number, b: number) => a + b * b, 0) / errors.length;
    const rmse = Math.sqrt(mse);
    return { latest, mae, rmse };
  }, [trendData]);

  return (
    <div className="min-h-screen bg-background">
      {loadingCompany && (
        <div className="fixed top-0 left-0 w-full bg-blue-100 text-blue-800 text-center py-2 z-50">Loading company data...</div>
      )}
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                ESG Risk Scoring Platform
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Comprehensive ESG analysis for informed investment decisions
              </p>
            </div>
            <CompanySearch 
              onCompanySelect={handleCompanySelect}
              selectedCompany={selectedCompany}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* ESG Prediction Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <ESGPredictionForm 
              onResult={setSingleResult}
              initialValues={{
                environmental_score: scoreCardCompany.environmentalScore ?? 0,
                social_score: scoreCardCompany.socialScore ?? 0,
                governance_score: scoreCardCompany.governanceScore ?? 0,
                // carbon_emissions isn't directly known from frontend mock; leave 0 unless backend returns in companyInfo in the future
                employee_satisfaction: typeof (companyInfo?.employee_satisfaction) === 'number' ? companyInfo.employee_satisfaction : 0,
                board_diversity: typeof (companyInfo?.board_diversity) === 'number' ? companyInfo.board_diversity : 0,
                controversies: typeof (companyInfo?.controversies) === 'number' ? companyInfo.controversies : 0,
              }}
            />
            {singleResult && (
              <div className="mt-2 p-2 border rounded bg-green-50">
                <strong>Predicted ESG Score:</strong> {singleResult.predicted_esg_score}
              </div>
            )}
          </div>
          <div>
            <ESGPredictionUpload onResults={setBatchResults} />
            {batchResults && (
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                  <thead>
                    <tr>
                      {Object.keys(batchResults[0]).map((col) => (
                        <th key={col} className="px-3 py-2 border-b text-left text-xs font-bold uppercase bg-gray-50">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-100">
                        {Object.keys(batchResults[0]).map((col) => (
                          <td key={col} className="px-3 py-2 border-b text-sm">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Score Card */}
          <div className="lg:col-span-1">
            <ESGScoreCard 
              company={scoreCardCompany}
              industryBenchmark={industryBenchmarkValue}
            />
          </div>

          {/* Right Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Company Metrics */}
            {companyMetrics.latest && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Selected Company Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-2">These metrics update when you change the selected company and are computed from its Actual vs Predicted history.</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Latest Snapshot</div>
                      <div className="text-sm">Year: <span className="font-medium">{companyMetrics.latest.month}</span></div>
                      <div className="text-sm">Actual: <span className="font-medium">{Number(companyMetrics.latest.scoreActual).toFixed(2)}</span></div>
                      <div className="text-sm">Predicted: <span className="font-medium">{Number(companyMetrics.latest.scorePredicted).toFixed(2)}</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Latest Residual</div>
                      <div className="text-2xl font-bold">
                        {(Number(companyMetrics.latest.scorePredicted) - Number(companyMetrics.latest.scoreActual)).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Predicted − Actual</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Error (history)</div>
                      <div className="text-sm">MAE: <span className="font-medium">{companyMetrics.mae?.toFixed(2)}</span></div>
                      <div className="text-sm">RMSE: <span className="font-medium">{companyMetrics.rmse?.toFixed(2)}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Risk Factors and Insights: Only show if available from backend (future) */}
            {/*
            {companyInfo?.riskFactors && companyInfo.riskFactors.length > 0 && (
              <RiskFactorAnalysis riskFactors={companyInfo.riskFactors} />
            )}
            {companyInfo?.textualInsights && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Automated Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {companyInfo.textualInsights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            */}

            {/* ESG Predictions Table */}
            {/* ESG Predictions Table: Only show after batch upload */}
            {batchResults && batchResults.length > 0 && (
              <div className="overflow-x-auto mt-6">
                  <h2 className="text-lg font-semibold mb-2">Predicted vs Actual ESG Scores</h2>
                  <div className="mb-3 text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <strong>What does this table show?</strong><br />
                    <ul className="list-disc ml-5 mt-1">
                      <li><b>Predicted ESG Score</b>: The score generated by the AI model for each row in your uploaded CSV.</li>
                      <li><b>Actual ESG Score</b>: The real score from our reference dataset, matched by the <b>company</b> column in your upload (if available).</li>
                    </ul>
                    <span className="block mt-2 text-xs text-gray-600">
                      <b>Note:</b> If "Actual ESG Score" is blank, it means the company name in your upload did not match any in our reference data. For best results, ensure your CSV has a <b>company</b> column matching our dataset.
                    </span>
                  </div>
                <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                  <thead>
                    <tr>
                      {Object.keys(batchResults[0]).map((col) => (
                        <th key={col} className="px-3 py-2 border-b text-left text-xs font-bold uppercase bg-gray-50">{col.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-100">
                        {Object.keys(batchResults[0]).map((col) => (
                          <td key={col} className="px-3 py-2 border-b text-sm">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Industry Comparison */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Industry Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Environmental" fill="hsl(var(--esg-environmental))" />
                        <Bar dataKey="Social" fill="hsl(var(--esg-social))" />
                        <Bar dataKey="Governance" fill="hsl(var(--esg-governance))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              {trendData.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>ESG Score Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="scoreActual"
                            name="Actual ESG"
                            stroke="hsl(var(--esg-governance))"
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--esg-governance))" }}
                            connectNulls
                          />
                          <Line
                            type="monotone"
                            dataKey="scorePredicted"
                            name="Predicted ESG"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--primary))" }}
                            strokeDasharray="5 5"
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}