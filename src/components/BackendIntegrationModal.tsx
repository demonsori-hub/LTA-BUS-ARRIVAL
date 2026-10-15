import React, { useState } from 'react';
import { X, Check, Copy, Server, Globe, ExternalLink, Code2 } from 'lucide-react';
import { ltaService } from '../services/ltaService';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndpointUpdated: (url: string) => void;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  onEndpointUpdated
}) => {
  const [customUrl, setCustomUrl] = useState(ltaService.getCustomBackendUrl());
  const [isCopied, setIsCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    ltaService.setCustomBackendUrl(customUrl);
    onEndpointUpdated(customUrl);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!customUrl) {
      setTestStatus('error');
      setTestMessage('Please enter a valid backend URL');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Pinging endpoint with BusStopCode=83139...');

    try {
      const url = customUrl.includes('?') ? `${customUrl}&BusStopCode=83139` : `${customUrl}?BusStopCode=83139`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTestStatus('success');
        setTestMessage(`Connected! Received ${data.Services?.length || 0} services for BusStopCode 83139.`);
      } else {
        const errJson = await res.json().catch(() => null);
        setTestStatus('error');
        setTestMessage(errJson?.message || `Server returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Network error / CORS blocked');
    }
  };

  const backendCodeSnippet = `// Node.js / Express Proxy for LTA DataMall v2
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const LTA_API_KEY = process.env.LTA_DATAMALL_KEY; // Your LTA DataMall AccountKey

app.get('/api/bus-arrival', async (req, res) => {
  const { BusStopCode, ServiceNo } = req.query;
  const url = new URL('http://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival');
  if (BusStopCode) url.searchParams.set('BusStopCode', String(BusStopCode));
  if (ServiceNo) url.searchParams.set('ServiceNo', String(ServiceNo));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'AccountKey': LTA_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch LTA bus arrival data' });
  }
});

app.listen(3001, () => console.log('LTA Proxy Server running on port 3001'));`;

  const copyCode = () => {
    navigator.clipboard.writeText(backendCodeSnippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Backend & LTA DataMall API Connector</h3>
              <p className="text-xs text-slate-400">Configure your backend proxy endpoint or view LTA API specs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Custom Endpoint Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Custom Backend Proxy Endpoint URL</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Leave blank to use live Singapore simulation engine
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="/api/busarrival"
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTestConnection}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors shrink-0"
              >
                Test Endpoint
              </button>
            </div>

            {testStatus !== 'idle' && (
              <div
                className={`text-xs p-2 rounded-lg ${
                  testStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : testStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {testMessage}
              </div>
            )}
          </div>

          {/* Architecture Note */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              LTA DataMall v2 Architecture Requirement
            </p>
            <p className="text-slate-600 leading-relaxed">
              LTA DataMall requires an HTTP header <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">AccountKey</code>. Because browsers block CORS requests to <code className="font-mono text-slate-700">http://datamall2.mytransport.sg</code> directly, your backend server should act as a proxy forwarding requests with your secret LTA key.
            </p>
          </div>

          {/* Copyable Backend Proxy Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-slate-500" />
                Ready-to-use Express Proxy Backend
              </span>
              <button
                onClick={copyCode}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
              {backendCodeSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              setCustomUrl('');
              ltaService.setCustomBackendUrl('');
              onEndpointUpdated('');
              onClose();
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
          >
            Reset to Simulation Mode
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
