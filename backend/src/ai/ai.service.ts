import { z, ZodType } from 'zod';
import { AIMessage, AIProvider, AIResponse, ModelTier } from './types.js';
import { groqProvider, openrouterProvider } from './providers.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { aiUsage } from '../db/schema.js';

interface StructuredAIRequest<T> {
  operation: string;
  messages: AIMessage[];
  schema: ZodType<T, any, any>;
  tier?: ModelTier;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
}

const providers: AIProvider[] = [groqProvider, openrouterProvider];

function getProvider(index: number): AIProvider | undefined {
  return providers[index];
}

async function trackUsage(response: AIResponse, operation: string, success: boolean, error?: string) {
  try {
    await db.insert(aiUsage).values({
      provider: response.provider,
      model: response.model,
      operation,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      latencyMs: response.latencyMs,
      success,
      error,
    });
  } catch (e) {
    // ponytail: non-critical — don't let tracking errors break AI calls
    logger.warn('Failed to track AI usage', { error: String(e) });
  }
}

/**
 * Core AI call with structured output validation, retry, and provider fallback.
 *
 * Flow: LLM → JSON → Zod validation → Valid? Yes → return / No → retry/repair → fallback provider
 */
export async function aiExtract<T>(request: StructuredAIRequest<T>): Promise<T> {
  const maxRetries = request.maxRetries ?? config.ai.maxRetries;
  let lastError: Error | null = null;

  for (let providerIdx = 0; providerIdx < providers.length; providerIdx++) {
    const provider = getProvider(providerIdx);
    if (!provider) break;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await provider.complete({
          messages: request.messages,
          temperature: request.temperature ?? 0.2,
          maxTokens: request.maxTokens ?? 4096,
          jsonMode: true,
        });

        // Parse JSON from response
        let parsed: unknown;
        try {
          parsed = JSON.parse(response.content);
        } catch {
          // Try extracting JSON from markdown code blocks
          const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]!);
          } else {
            throw new Error('Response is not valid JSON');
          }
        }

        // Validate against schema
        const result = request.schema.safeParse(parsed);
        if (result.success) {
          await trackUsage(response, request.operation, true);
          return result.data;
        }

        // Schema validation failed — log and retry
        const validationError = result.error.message;
        logger.warn('AI output schema validation failed', {
          operation: request.operation,
          provider: provider.name,
          attempt,
          error: validationError,
        });
        lastError = new Error(`Schema validation failed: ${validationError}`);

        await trackUsage(response, request.operation, false, validationError);

      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error('AI call failed', {
          operation: request.operation,
          provider: provider.name,
          attempt,
          error: errMsg,
        });
        lastError = error instanceof Error ? error : new Error(errMsg);

        // Don't retry on malformed input
        if (errMsg.includes('400') || errMsg.includes('invalid')) {
          break;
        }

        // If rate limited (429), respect suggested wait or switch to fallback provider
        if (errMsg.includes('429') || errMsg.includes('rate_limit')) {
          const msMatch = errMsg.match(/try again in ([\d\.]+)\s*ms/i);
          const sMatch = errMsg.match(/try again in ([\d\.]+)\s*s/i);
          const waitMs = msMatch
            ? Math.ceil(parseFloat(msMatch[1]!))
            : sMatch
            ? Math.ceil(parseFloat(sMatch[1]!) * 1000)
            : 0;

          if (waitMs > 0 && waitMs <= 5000) {
            logger.info(`Rate limit hit on ${provider.name}, waiting ${(waitMs + 300)}ms before retry`);
            await new Promise((r) => setTimeout(r, waitMs + 300));
            continue;
          }
          // If wait is long or multiple attempts failed, break to fallback provider
          break;
        }

        // Exponential backoff
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt, 10000)));
        }
      }
    }

    logger.info(`Provider ${provider.name} exhausted, trying fallback`, { operation: request.operation });
  }

  throw lastError ?? new Error('All AI providers failed');
}

/** Simple unstructured AI completion with fallback. */
export async function aiComplete(
  messages: AIMessage[],
  operation: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  for (let providerIdx = 0; providerIdx < providers.length; providerIdx++) {
    const provider = getProvider(providerIdx);
    if (!provider) break;

    try {
      const response = await provider.complete({
        messages,
        temperature: options?.temperature ?? 0.5,
        maxTokens: options?.maxTokens ?? 2048,
      });
      await trackUsage(response, operation, true);
      return response.content;
    } catch (error) {
      logger.warn('AI completion failed, trying fallback', {
        provider: provider.name,
        error: String(error),
      });
    }
  }
  throw new Error('All AI providers failed for completion');
}
