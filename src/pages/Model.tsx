import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CompanySearch } from '@/components/CompanySearch';
import { EnvWarning } from '@/components/EnvWarning';

type Metrics = { rmse?: number; mae?: number; r2?: number; trained_at?: string };
type FeatureImportance = { feature: string; importance: number }[];

export default function Model() {
  const [metrics, setMetrics] = useState<Metrics>({});
  const [features, setFeatures] = useState<string[]>([]);
  const [importance, setImportance] = useState<FeatureImportance>([]);
  const [loading, setLoading] = useState(true);
  
  // Per-company state
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const loadDiagnostics = useCallback(() => {
    setLoading(true);
    let mounted = true;
    Promise.all([
      apiFetch('/model/metrics').then(r => r.json()).catch(() => ({ metrics: {} })),
      apiFetch('/model/features').then(r => r.json()).catch(() => ({ features: [] })),
      apiFetch('/model/feature-importance').then(r => r.json()).catch(() => ({ featureImportance: [] })),
    ])
      .then(([m, f, fi]) => {
        if (!mounted) return;
        setMetrics(m.metrics || {});
        setFeatures(f.features || []);
        setImportance((fi.featureImportance || []).map((x: any) => ({ feature: x.feature, importance: Number(x.importance) })));
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = loadDiagnostics();
    return cleanup;
  }, [loadDiagnostics]);

  // Optional: initialize from URL query (?company=Name); no auto-select otherwise
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('company');
    if (c) {
      setSelectedCompany({ name: c, symbol: c, sector: '' });
    }
  }, []);

  const fetchCompanyData = useCallback((companyName: string) => {
    setLoadingCompany(true);
    apiFetch(`/company-esg-info?company=${encodeURIComponent(companyName)}`)
      .then(res => res.json())
      .then(data => {
        const t = (data.trend || [])
          .slice()
          .sort((a: any, b: any) => (Number(a?.year ?? 0) - Number(b?.year ?? 0)))
          .map((d: any, i: number) => ({
            month: d?.year ? String(d.year) : `Point ${i + 1}`,
            scoreActual: d?.actual_esg_score ?? null,
            scorePredicted: d?.predicted_esg_score ?? null,
          }));
        setTrendData(t);
      })
      .finally(() => setLoadingCompany(false));
  }, []);

  // Load selected company data whenever it changes
  useEffect(() => {
    if (selectedCompany?.name) {
      fetchCompanyData(selectedCompany.name);
    }
  }, [selectedCompany, fetchCompanyData]);

  // Compute per-company metrics from trendData
  const companyMetrics = useMemo(() => {
    const pairs = trendData.filter((d: any) => typeof d?.scoreActual === 'number' && typeof d?.scorePredicted === 'number');
    if (pairs.length === 0) return null as null | { latest: any; mae: number; rmse: number };
    const latest = pairs[pairs.length - 1];
    const errors = pairs.map((d: any) => (Number(d.scorePredicted) - Number(d.scoreActual)));
    const mae = errors.reduce((a: number, b: number) => a + Math.abs(b), 0) / errors.length;
    const rmse = Math.sqrt(errors.reduce((a: number, b: number) => a + b * b, 0) / errors.length);
    return { latest, mae, rmse };
  }, [trendData]);

  // Per-year metrics with cumulative R² (requires at least two points)
  const byYearMetrics = useMemo(() => {
    const pairs = trendData.filter((d: any) => typeof d?.scoreActual === 'number' && typeof d?.scorePredicted === 'number');
    if (pairs.length === 0) return [] as Array<{ year: string; actual: number; predicted: number; error: number; mse: number; rmse: number; r2: number | null }>;
    const rows: Array<{ year: string; actual: number; predicted: number; error: number; mse: number; rmse: number; r2: number | null }> = [];
    const actuals: number[] = [];
    const preds: number[] = [];
    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i];
      const a = Number(p.scoreActual);
      const pr = Number(p.scorePredicted);
      actuals.push(a);
      preds.push(pr);
      const err = pr - a;
      const mse = err * err;
      const rmse = Math.sqrt(mse);
      let r2: number | null = null;
      if (i >= 1) {
        const meanA = actuals.slice(0, i + 1).reduce((x, y) => x + y, 0) / (i + 1);
        const ssRes = actuals.slice(0, i + 1).reduce((s, y, idx) => s + Math.pow(y - preds[idx], 2), 0);
        const ssTot = actuals.slice(0, i + 1).reduce((s, y) => s + Math.pow(y - meanA, 2), 0);
        r2 = ssTot === 0 ? null : 1 - ssRes / ssTot;
      }
      rows.push({ year: String(p.month), actual: a, predicted: pr, error: err, mse, rmse, r2 });
    }
    return rows;
  }, [trendData]);

  const impData = importance.length > 0 ? importance : features.map((ft) => ({ feature: ft, importance: 0 }));

  return (
    <div className="min-h-screen bg-background">
      <EnvWarning />
      <div className="border-b border-border bg-gradient-primary">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-primary-foreground">Model Diagnostics</h1>
              <p className="text-primary-foreground/80 text-sm">Metrics, features, and feature importance from the current model</p>
              <div className="max-w-md">
                <CompanySearch onCompanySelect={setSelectedCompany} selectedCompany={selectedCompany} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary"
                onClick={() => { loadDiagnostics(); if (selectedCompany?.name) fetchCompanyData(selectedCompany.name); }}
                disabled={loading || loadingCompany}
              >
                {(loading || loadingCompany) ? 'Refreshing…' : 'Refresh'}
              </Button>
              <Link to="/">
                <Button variant="default">Back to ESG Risk Scoring Platform</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Global Metrics Header */}
        <div>
          <h2 className="text-lg font-semibold">Global Model Metrics (dataset-wide)</h2>
          <p className="text-sm text-muted-foreground">These summarize performance across the dataset and do not change when you select a company.</p>
        </div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle>RMSE</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{metrics.rmse !== undefined ? metrics.rmse.toFixed(2) : (loading ? '…' : 'N/A')}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>MAE</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{metrics.mae !== undefined ? metrics.mae.toFixed(2) : (loading ? '…' : 'N/A')}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>R²</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{metrics.r2 !== undefined ? metrics.r2.toFixed(3) : (loading ? '…' : 'N/A')}</CardContent>
          </Card>
        </div>

        {/* Selected Company Metrics (dynamic) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Selected Company Metrics {selectedCompany?.name ? `— ${selectedCompany.name}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">These metrics change with the selected company based on its available actual vs predicted history.</div>
            {!selectedCompany?.name && (
              <div className="text-sm text-muted-foreground">Select a company above to see per-company metrics.</div>
            )}
            {selectedCompany?.name && !companyMetrics && (
              <div className="text-sm text-muted-foreground">No historical actual vs predicted points available for this company.</div>
            )}
            {selectedCompany?.name && companyMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Latest Snapshot</div>
                  <div className="text-sm">Year: <span className="font-medium">{companyMetrics.latest.month}</span></div>
                  <div className="text-sm">Actual: <span className="font-medium">{Number(companyMetrics.latest.scoreActual).toFixed(2)}</span></div>
                  <div className="text-sm">Predicted: <span className="font-medium">{Number(companyMetrics.latest.scorePredicted).toFixed(2)}</span></div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Latest Residual</div>
                  <div className="text-2xl font-bold">{(Number(companyMetrics.latest.scorePredicted) - Number(companyMetrics.latest.scoreActual)).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Predicted − Actual</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Error (history)</div>
                  <div className="text-sm">MAE: <span className="font-medium">{companyMetrics.mae.toFixed(2)}</span></div>
                  <div className="text-sm">RMSE: <span className="font-medium">{companyMetrics.rmse.toFixed(2)}</span></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Year Error Metrics (per selected company) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>By Year Error Metrics {selectedCompany?.name ? `— ${selectedCompany.name}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">R² is shown cumulatively up to each year (requires at least two points); per-year RMSE and MSE are based on that year’s single error.</div>
            {!selectedCompany?.name && (
              <div className="text-sm text-muted-foreground">Select a company above to see by-year metrics.</div>
            )}
            {selectedCompany?.name && byYearMetrics.length === 0 && (
              <div className="text-sm text-muted-foreground">No data available to compute by-year metrics.</div>
            )}
            {selectedCompany?.name && byYearMetrics.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded shadow text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border-b text-left">Year</th>
                      <th className="px-3 py-2 border-b text-right">Actual</th>
                      <th className="px-3 py-2 border-b text-right">Predicted</th>
                      <th className="px-3 py-2 border-b text-right">Error</th>
                      <th className="px-3 py-2 border-b text-right">MSE</th>
                      <th className="px-3 py-2 border-b text-right">RMSE</th>
                      <th className="px-3 py-2 border-b text-right">R² (cumulative)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byYearMetrics.map((r) => (
                      <tr key={r.year} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border-b">{r.year}</td>
                        <td className="px-3 py-2 border-b text-right">{r.actual.toFixed(2)}</td>
                        <td className="px-3 py-2 border-b text-right">{r.predicted.toFixed(2)}</td>
                        <td className="px-3 py-2 border-b text-right">{r.error.toFixed(2)}</td>
                        <td className="px-3 py-2 border-b text-right">{r.mse.toFixed(2)}</td>
                        <td className="px-3 py-2 border-b text-right">{r.rmse.toFixed(2)}</td>
                        <td className="px-3 py-2 border-b text-right">{r.r2 === null ? '—' : r.r2.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Importance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impData}>
                  <XAxis dataKey="feature" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="importance" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Trained At: {metrics.trained_at || (loading ? '…' : 'N/A')}</div>
            <div className="text-xs text-muted-foreground mt-1">Features: {features.join(', ') || (loading ? '…' : 'N/A')}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
