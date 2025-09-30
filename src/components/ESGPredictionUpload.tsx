import React, { useState } from 'react';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { apiFetch } from '@/lib/api';

export function ESGPredictionUpload({ onResults }: { onResults: (results: any[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvValid, setCsvValid] = useState<boolean>(true);
  const requiredColumns = [
    'environmental_score',
    'social_score',
    'governance_score',
    'carbon_emissions',
    'employee_satisfaction',
    'board_diversity',
    'controversies',
    // 'actual_esg_score' // optional, but recommended for comparison
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      Papa.parse(selectedFile, {
        header: true,
        preview: 1,
        complete: (results) => {
          const columns = results.meta.fields || [];
          const missing = requiredColumns.filter(col => !columns.includes(col));
          if (missing.length > 0) {
            setCsvValid(false);
            setError(`Missing required columns: ${missing.join(', ')}`);
            setFile(null);
          } else {
            setCsvValid(true);
            setError(null);
            setFile(selectedFile);
          }
        },
        error: (err) => {
          setCsvValid(false);
          setError('Error parsing CSV: ' + err.message);
          setFile(null);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !csvValid) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/predict-csv', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Batch prediction failed');
      const data = await res.json();
      onResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded bg-white shadow mt-4">
      <h3 className="font-semibold">Batch ESG Prediction (CSV Upload)</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button type="submit" disabled={loading || !file || !csvValid}>{loading ? 'Predicting...' : 'Upload & Predict'}</Button>
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="text-xs text-gray-500 mt-2">
        Required columns: {requiredColumns.join(', ')}
      </div>
    </form>
  );
}
