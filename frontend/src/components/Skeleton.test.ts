import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Skeleton,
  MetricsGridSkeleton,
  OpportunityCardSkeleton,
  DashboardSkeleton,
  CompanyRowSkeleton,
  CompaniesDirectorySkeleton,
  CompanyDetailSkeleton,
  TabContentSkeleton,
} from './Skeleton.js';

test('Skeleton renders primitive with correct classes and accessibility attribute', () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, { variant: 'squircle', width: 48, height: 48, className: 'custom-cls' })
  );
  assert.ok(html.includes('skeleton'), 'Should have skeleton class');
  assert.ok(html.includes('skeleton-squircle'), 'Should have skeleton-squircle class');
  assert.ok(html.includes('custom-cls'), 'Should have custom-cls class');
  assert.ok(html.includes('aria-hidden="true"'), 'Should be hidden from screen readers');
});

test('MetricsGridSkeleton renders 4 metric card placeholders with metrics-strip class', () => {
  const html = renderToStaticMarkup(createElement(MetricsGridSkeleton));
  assert.ok(html.includes('metrics-strip'), 'Should use metrics-strip layout');
  const count = (html.match(/metric-card/g) || []).length;
  assert.equal(count, 4, 'Should render exactly 4 metric cards');
});

test('OpportunityCardSkeleton renders expected opportunity structure', () => {
  const html = renderToStaticMarkup(createElement(OpportunityCardSkeleton));
  assert.ok(html.includes('opportunity-card'), 'Should have opportunity-card class');
  assert.ok(html.includes('opportunity-grid'), 'Should render metadata grid');
});

test('DashboardSkeleton aggregates metrics and 3 opportunity card skeletons', () => {
  const html = renderToStaticMarkup(createElement(DashboardSkeleton));
  assert.ok(html.includes('metrics-strip'), 'Should contain metrics-strip');
  const count = (html.match(/opportunity-card/g) || []).length;
  assert.equal(count, 3, 'Should render exactly 3 opportunity cards');
});

test('CompaniesDirectorySkeleton renders directory rows', () => {
  const rowHtml = renderToStaticMarkup(createElement(CompanyRowSkeleton));
  assert.ok(rowHtml.includes('card'), 'CompanyRowSkeleton should render card layout');
  const html = renderToStaticMarkup(createElement(CompaniesDirectorySkeleton));
  assert.ok(html.includes('skeleton-squircle'), 'Should have squircle logo placeholders');
});

test('CompanyDetailSkeleton renders header, segmented control, and card content', () => {
  const html = renderToStaticMarkup(createElement(CompanyDetailSkeleton));
  assert.ok(html.includes('page-header'), 'Should have page-header');
  assert.ok(html.includes('segmented-control'), 'Should have segmented-control');
});

test('TabContentSkeleton renders configurable card count', () => {
  const html = renderToStaticMarkup(createElement(TabContentSkeleton, { cards: 2 }));
  const count = (html.match(/card/g) || []).length;
  assert.equal(count, 2, 'Should render requested number of card skeletons');
});
