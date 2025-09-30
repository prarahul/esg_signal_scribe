import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
// ...existing code...
import { apiFetch } from '@/lib/api';

export interface SinglePredictionInput {
  environmental_score: number;
  social_score: number;
  governance_score: number;
  carbon_emissions: number;
  employee_satisfaction: number;
  board_diversity: number;
  controversies: number;
}

export function ESGPredictionForm({ onResult, initialValues }: { onResult: (result: any) => void; initialValues?: Partial<SinglePredictionInput> }) {
  const defaults: SinglePredictionInput = {
    environmental_score: 0,
    social_score: 0,
    governance_score: 0,
    carbon_emissions: 0,
    employee_satisfaction: 0,
    board_diversity: 0,
    controversies: 0,
  };
  const init: SinglePredictionInput = useMemo(() => ({
    ...defaults,
    ...initialValues,
  }), [initialValues]);
  const [form, setForm] = useState<SinglePredictionInput>(init);
  
  // Keep the form in sync when initialValues change (e.g., when a new company is selected)
  useEffect(() => {
    setForm(init);
  }, [init]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let num = Number(value);
    // Apply simple ranges: scores [0-100], controversies [0-100], carbon_emissions [0-1e9]
    if (['environmental_score', 'social_score', 'governance_score', 'employee_satisfaction', 'board_diversity'].includes(name)) {
      num = clamp(num, 0, 100);
    } else if (name === 'controversies') {
      num = clamp(num, 0, 100);
    } else if (name === 'carbon_emissions') {
      num = clamp(num, 0, 1_000_000_000);
    }
    setForm({ ...form, [name]: num });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Prediction failed');
      const data = await res.json();
      onResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded bg-white shadow">
      <h3 className="font-semibold">Single ESG Prediction</h3>
      {(
        [
          { key: 'environmental_score', label: 'environmental score (0-100)', min: 0, max: 100, step: 1 },
          { key: 'social_score', label: 'social score (0-100)', min: 0, max: 100, step: 1 },
          { key: 'governance_score', label: 'governance score (0-100)', min: 0, max: 100, step: 1 },
          { key: 'carbon_emissions', label: 'carbon emissions (tons CO₂e)', min: 0, max: 1_000_000_000, step: 1 },
          { key: 'employee_satisfaction', label: 'employee satisfaction (0-100)', min: 0, max: 100, step: 1 },
          { key: 'board_diversity', label: 'board diversity (0-100)', min: 0, max: 100, step: 1 },
          { key: 'controversies', label: 'controversies (0-100)', min: 0, max: 100, step: 1 },
        ] as const
      ).map((f) => (
        <div key={f.key} className="flex flex-col">
          <label htmlFor={f.key} className="text-xs font-medium capitalize">{f.label}</label>
          <input
            id={f.key}
            name={f.key}
            type="number"
            value={form[f.key as keyof SinglePredictionInput]}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
            step={f.step}
            min={f.min}
            max={f.max}
            required
          />
        </div>
      ))}
      <Button type="submit" disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</Button>
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </form>
  );
}
