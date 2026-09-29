import { AIProvider, AIRequestOptions, AIResponse } from './types.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// ponytail: Both Groq and OpenRouter use OpenAI-compatible chat API.
// Single provider implementation covers both — just different base URLs and headers.

interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  fastModel: string;
  extraHeaders?: Record<string, string>;
}

function createOpenAICompatibleProvider(cfg: ProviderConfig): AIProvider {
  return {
    name: cfg.name,
    async complete(options: AIRequestOptions): Promise<AIResponse> {
      const model = options.model || cfg.defaultModel;
      const start = Date.now();

      const body: Record<string, unknown> = {
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 4096,
      };

      if (options.jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.apiKey}`,
          ...cfg.extraHeaders,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(config.ai.timeoutMs),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${cfg.name} API error ${res.status}: ${text}`);
      }

      const data = await res.json() as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const latencyMs = Date.now() - start;

      return {
        content: data.choices[0]?.message?.content ?? '',
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
        model,
        provider: cfg.name,
        latencyMs,
      };
    },
  };
}

export const groqProvider = createOpenAICompatibleProvider({
  name: 'groq',
  baseUrl: 'https://api.groq.com/openai/v1',
  apiKey: config.ai.groq.apiKey,
  defaultModel: config.ai.groq.model,
  fastModel: config.ai.groq.fastModel,
});

export const openrouterProvider = createOpenAICompatibleProvider({
  name: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: config.ai.openrouter.apiKey,
  defaultModel: config.ai.openrouter.model,
  fastModel: config.ai.openrouter.fastModel,
  extraHeaders: {
    'HTTP-Referer': 'https://signaldesk.app',
    'X-Title': 'SignalDesk',
  },
});
