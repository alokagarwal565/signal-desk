import { describe, it, expect } from 'vitest';
import { rankItem, type DashboardItem } from './dashboard.service.js';

describe('rankItem', () => {
  const baseItem: DashboardItem = {
    company: {
      id: 'test-co-1',
      name: 'Acme Corp',
      domain: 'acme.com',
      industry: 'SaaS',
    },
    opportunity: {
      totalScore: 70,
      strategicFit: 25,
      recentTrigger: 20,
      growthSignal: 15,
      reachability: 5,
      evidenceConfidence: 5,
      whyNow: 'Just announced Series B funding',
      confidence: 'high',
    },
    strongestSignal: null,
    topPerson: null,
    recommendedAction: 'Reach out to VP of Sales',
  };

  it('returns 0 if opportunity is null', () => {
    const itemWithoutOpp: DashboardItem = { ...baseItem, opportunity: null };
    expect(rankItem(itemWithoutOpp)).toBe(0);
  });

  it('calculates baseline rank matching totalScore + 0.5 * recentTrigger', () => {
    // 70 + (20 * 0.5) = 80
    expect(rankItem(baseItem)).toBe(80);
  });

  it('adds bonus when key person is identified (+5)', () => {
    const itemWithPerson: DashboardItem = {
      ...baseItem,
      topPerson: {
        name: 'Jane Doe',
        role: 'VP Sales',
        whyRelevant: 'Decision maker for tooling',
      },
    };
    // 80 + 5 = 85
    expect(rankItem(itemWithPerson)).toBe(85);
  });

  it('adds bonus when strong signal is detected (+3)', () => {
    const itemWithSignal: DashboardItem = {
      ...baseItem,
      strongestSignal: {
        type: 'HIRING',
        description: 'Expanding engineering and sales teams',
      },
    };
    // 80 + 3 = 83
    expect(rankItem(itemWithSignal)).toBe(83);
  });

  it('applies penalties for low or unknown confidence', () => {
    const lowConfidenceItem: DashboardItem = {
      ...baseItem,
      opportunity: {
        ...baseItem.opportunity!,
        confidence: 'low',
      },
    };
    // 80 - 10 = 70
    expect(rankItem(lowConfidenceItem)).toBe(70);

    const unknownConfidenceItem: DashboardItem = {
      ...baseItem,
      opportunity: {
        ...baseItem.opportunity!,
        confidence: 'unknown',
      },
    };
    // 80 - 15 = 65
    expect(rankItem(unknownConfidenceItem)).toBe(65);
  });
});
