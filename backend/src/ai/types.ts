import { z } from 'zod';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AIResponse {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  model: string;
  provider: string;
  latencyMs: number;
}

export interface AIProvider {
  name: string;
  complete(options: AIRequestOptions): Promise<AIResponse>;
}

export type ModelTier = 'fast' | 'strong';
