import React from 'react';
import { API_BASE } from '@/lib/api';

export function EnvWarning() {
  const isHosted = typeof window !== 'undefined' && window.location.host.endsWith('netlify.app');
  const isLocalApi = API_BASE.includes('127.0.0.1') || API_BASE.includes('localhost');
  if (!isHosted || !isLocalApi) return null;
  return (
    <div className="w-full bg-amber-50 text-amber-800 text-xs py-2 text-center px-3">
      Backend API is set to {API_BASE}. From a hosted site, browsers cannot reach a local server. Set VITE_API_URL to your public HTTPS backend and redeploy.
    </div>
  );
}
