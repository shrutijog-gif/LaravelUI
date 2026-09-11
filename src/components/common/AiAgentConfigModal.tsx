import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Key, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { 
  getGroqConfig, 
  saveGroqConfig, 
  testGroqConnection 
} from '../../services/aiAgentService';
import { GROQ_MODELS, GroqModelId } from '../../types/ai';

interface AiAgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AiAgentConfigModal: React.FC<AiAgentConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const currentConfig = getGroqConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [selectedModel, setSelectedModel] = useState<GroqModelId>(currentConfig.model || 'openai/gpt-oss-20b');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGroqConnection(apiKey, selectedModel);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
        latencyMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveGroqConfig({
      apiKey: apiKey.trim(),
      model: selectedModel,
    });
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ea580c]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Groq Cloud AI LPU™ Settings
              </h3>
              <p className="text-xs text-gray-500 font-medium">Configure Language Processing Unit & Models</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Select Groq AI Model
          </label>
          <div className="grid grid-cols-1 gap-2">
            {GROQ_MODELS.map((model) => (
              <label
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'border-orange-500 bg-orange-50/50 shadow-2xs'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="groq-model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={() => setSelectedModel(model.id)}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{model.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                      {model.speed}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{model.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-orange-600" />
              <span>Groq API Key</span>
            </label>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-orange-600 hover:underline flex items-center gap-1 font-medium"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Live Test Ping Result */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{testResult.message}</span>
              {testResult.latencyMs > 0 && (
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  Latency: {testResult.latencyMs}ms | Cloud LPU Active
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestPing}
            disabled={isTesting}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                <span>Testing Ping...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                <span>Test LPU Ping</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
