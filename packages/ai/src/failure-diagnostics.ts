import { z } from 'zod';

const stages = ['invalid_envelope', 'empty_content', 'unparseable_content', 'empty_items'] as const;
export type AIFailureStage = typeof stages[number];
export interface AIValidationIssue { path: string; code: z.ZodIssueCode }
export interface AIFailureDiagnostics {
  failureStage?: AIFailureStage;
  validationIssues?: AIValidationIssue[];
}
const rootFields = new Set(['items', 'merchant_name', 'invoice_number', 'purchase_date', 'total_amount_vnd']);
const itemFields = new Set(['raw_name', 'estimated_quantity', 'unit', 'confidence', 'storage', 'category', 'canonical_id', 'unit_price_vnd', 'total_price_vnd']);
const issueCodes = new Set<string>(Object.values(z.ZodIssueCode));

function issuePath(path: Array<string | number>): string {
  if (path.length === 0) return '$';
  if (path.length === 1 && rootFields.has(String(path[0]))) return String(path[0]);
  if (path[0] === 'items' && Number.isSafeInteger(path[1]) && Number(path[1]) >= 0) {
    if (path.length === 2) return 'items[]';
    if (path.length === 3 && itemFields.has(String(path[2]))) return `items[].${path[2]}`;
  }
  return '$other';
}

/** Only fixed schema paths and codes cross the logging/repair boundary. */
export function sanitizeFailureDiagnostics(value: unknown): AIFailureDiagnostics {
  if (!value || typeof value !== 'object') return {};
  const record = value as Record<string, unknown>;
  const result: AIFailureDiagnostics = {};
  if (stages.some(stage => stage === record.failureStage)) result.failureStage = record.failureStage as AIFailureStage;
  if (Array.isArray(record.validationIssues)) {
    const issues: AIValidationIssue[] = [];
    const seen = new Set<string>();
    for (const issue of record.validationIssues) {
      if (!issue || typeof issue !== 'object') continue;
      const { path, code } = issue as Record<string, unknown>;
      if (typeof path !== 'string' || typeof code !== 'string' || !issueCodes.has(code)) continue;
      const validPath = path === '$' || path === '$other' || path === 'items[]' || rootFields.has(path)
        || (path.startsWith('items[].') && itemFields.has(path.slice('items[].'.length)));
      if (!validPath || seen.has(`${path}:${code}`)) continue;
      seen.add(`${path}:${code}`);
      issues.push({ path, code: code as z.ZodIssueCode });
      if (issues.length === 8) break;
    }
    if (issues.length) result.validationIssues = issues;
  }
  return result;
}

export function failureDiagnostics(error: unknown): AIFailureDiagnostics {
  const schemaError = error instanceof z.ZodError ? error
    : error instanceof Error && error.cause instanceof z.ZodError ? error.cause : undefined;
  return sanitizeFailureDiagnostics({
    failureStage: error && typeof error === 'object' && 'failureStage' in error ? error.failureStage : undefined,
    validationIssues: schemaError?.issues.map(issue => ({ path: issuePath(issue.path), code: issue.code })),
  });
}
