import { SeoMetadata, SeoAuditScoreResult } from './seo';

export type GroqModelId = 
  | 'openai/gpt-oss-20b'
  | 'openai/gpt-oss-120b'
  | 'qwen/qwen3.6-27b'
  | 'groq/compound'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-32768';

export interface GroqModelOption {
  id: GroqModelId;
  name: string;
  description: string;
  speed: string;
}

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B (High-Speed SEO)',
    description: 'Ultra-fast low-latency inference optimized for SERP metadata generation',
    speed: '~750 T/s'
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B (Deep Reasoning)',
    description: 'Complex semantic understanding and comprehensive entity extraction',
    speed: '~450 T/s'
  },
  {
    id: 'qwen/qwen3.6-27b',
    name: 'Qwen 3.6 27B (Multilingual)',
    description: 'Exceptional multilingual SEO and keyword localization',
    speed: '~600 T/s'
  },
  {
    id: 'groq/compound',
    name: 'Groq Compound (Agentic Synthesis)',
    description: 'Multi-stage autonomous audit and schema validation engine',
    speed: '~500 T/s'
  }
];

export interface GroqConfig {
  apiKey: string;
  model: GroqModelId;
  temperature: number;
  maxTokens: number;
}

export interface AIAgentGenerationResult {
  seo: SeoMetadata;
  audit: SeoAuditScoreResult;
  modelUsed: string;
  provider: 'groq';
  tokensUsed?: number;
  latencyMs: number;
  agentReasoning?: string;
}

export interface AIPageComponentResult {
  title: string;
  category: string;
  description: string;
  htmlCode: string;
}
