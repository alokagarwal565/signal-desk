import { describe, it, expect } from 'vitest';
import { computeOpportunityScore, WEIGHTS } from './opportunities.service.js';

describe('computeOpportunityScore', () => {
  it('calculates perfect 100 score for max attributes', () => {
    const result = computeOpportunityScore({
      strategicFit: 1.0,
      recentTrigger: 1.0,
      growthSignal: 1.0,
      reachability: 1.0,
      evidenceConfidence: 1.0,
    });

    expect(result.strategicFit).toBe(WEIGHTS.strategicFit);
    expect(result.recentTrigger).toBe(WEIGHTS.recentTrigger);
    expect(result.growthSignal).toBe(WEIGHTS.growthSignal);
    expect(result.reachability).toBe(WEIGHTS.reachability);
    expect(result.evidenceConfidence).toBe(WEIGHTS.evidenceConfidence);
    expect(result.totalScore).toBe(100);
  });

  it('calculates 0 score for zero attributes', () => {
    const result = computeOpportunityScore({
      strategicFit: 0,
      recentTrigger: 0,
      growthSignal: 0,
      reachability: 0,
      evidenceConfidence: 0,
    });

    expect(result.totalScore).toBe(0);
  });

  it('correctly weighs individual dimensions', () => {
    // Only strategic fit (30% weight) at 0.5 -> 15 points
    const result = computeOpportunityScore({
      strategicFit: 0.5,
      recentTrigger: 0,
      growthSignal: 0,
      reachability: 0,
      evidenceConfidence: 0,
    });

    expect(result.strategicFit).toBe(15);
    expect(result.totalScore).toBe(15);
  });

  it('rounds decimal scores correctly', () => {
    const result = computeOpportunityScore({
      strategicFit: 0.33,
      recentTrigger: 0.67,
      growthSignal: 0.85,
      reachability: 0.45,
      evidenceConfidence: 0.9,
    });

    // 0.33 * 30 = 9.9 -> 10
    // 0.67 * 25 = 16.75 -> 17
    // 0.85 * 20 = 17 -> 17
    // 0.45 * 15 = 6.75 -> 7
    // 0.9 * 10 = 9 -> 9
    // total: 10 + 17 + 17 + 7 + 9 = 60
    expect(result.strategicFit).toBe(10);
    expect(result.recentTrigger).toBe(17);
    expect(result.growthSignal).toBe(17);
    expect(result.reachability).toBe(7);
    expect(result.evidenceConfidence).toBe(9);
    expect(result.totalScore).toBe(60);
  });
});
