import { z } from 'zod';
import type { AgDataSourcesDefinition } from 'ag-studio';
import { api } from '../lib/api';

// GET /api/v1/insights/datasets (AG_GRID_USAGE.md §2.2). User-scoped, read-only, no payer data.
// Money arrives as numbers (2 dp) for charting; Studio formats it with currencyFormat.

const row = z.record(z.unknown());
export const InsightDatasetsSchema = z.object({
  currency: z.string(),
  from: z.string(),
  to: z.string(),
  purchases: z.array(row),
  lineItems: z.array(row),
  ledger: z.array(row),
  evaluations: z.array(row),
  budgets: z.array(row),
  merchants: z.array(row),
});
export type InsightDatasets = z.infer<typeof InsightDatasetsSchema>;

export const fetchInsightDatasets = () => api('/insights/datasets', { schema: InsightDatasetsSchema });

type Format = 'textFormat' | 'currencyFormat' | 'integerFormat' | 'dateFormat' | 'dateTimeFormat' | 'booleanFormat';
interface FieldSpec {
  id: string;
  name: string;
  format: Format;
  description?: string;
}

const text = (id: string, name: string, description?: string): FieldSpec => ({ id, name, format: 'textFormat', description });
const money = (id: string, name: string, description?: string): FieldSpec => ({ id, name, format: 'currencyFormat', description });
const date = (id: string, name: string): FieldSpec => ({ id, name, format: 'dateFormat' });
const dateTime = (id: string, name: string): FieldSpec => ({ id, name, format: 'dateTimeFormat' });
const int = (id: string, name: string, description?: string): FieldSpec => ({ id, name, format: 'integerFormat', description });
const bool = (id: string, name: string): FieldSpec => ({ id, name, format: 'booleanFormat' });

interface TableSpec {
  id: keyof Omit<InsightDatasets, 'currency' | 'from' | 'to'>;
  name: string;
  description: string;
  primaryKeyField?: string;
  fields: FieldSpec[];
}

/** Table and field metadata. Descriptions are also what Studio's AI agents read about the data. */
export const tableSpecs: TableSpec[] = [
{
  id: 'purchases',
  name: 'Purchases',
  primaryKeyField: 'purchaseId',
  description: "One row per purchase the user's rules allowed or they approved, with its payment outcome.",
  fields: [
  text('purchaseId', 'Purchase ID'),
  dateTime('createdAt', 'Created'),
  date('weekStart', 'Budget week'),
  date('monthStart', 'Budget month'),
  text('merchant', 'Merchant'),
  text('merchantStatus', 'Merchant status', 'APPROVED, BLOCKED or NEW under the current rules'),
  money('amount', 'Amount'),
  text('currency', 'Currency'),
  text('status', 'Purchase status', 'e.g. COMPLETED, AWAITING_APPROVAL, REJECTED, FAILED'),
  text('decision', 'Policy decision', 'ALLOWED or REQUIRES_APPROVAL (blocked carts never become purchases)'),
  text('requestedBy', 'Requested by', 'AGENT (the AI assistant) or USER'),
  int('approvalMinutes', 'Minutes to approve', 'Time between the approval request and the user approving it'),
  bool('finalCheckPassed', 'Final check passed'),
  text('paymentStatus', 'Payment status', 'e.g. COMPLETED, VOIDED')]

},
{
  id: 'lineItems',
  name: 'Line items',
  description: 'One row per product line in a purchase: what was bought, where and at what unit price.',
  fields: [
  text('purchaseId', 'Purchase ID'),
  dateTime('createdAt', 'Bought'),
  date('weekStart', 'Budget week'),
  text('merchant', 'Merchant'),
  text('product', 'Product'),
  text('categoryCode', 'Category'),
  money('unitPrice', 'Unit price'),
  int('quantity', 'Quantity'),
  money('lineTotal', 'Line total')]

},
{
  id: 'ledger',
  name: 'Spending ledger',
  description: 'Every movement of money between budget buckets: Proposed → Reserved → Authorized → Captured, or Released/Failed.',
  fields: [
  dateTime('occurredAt', 'Occurred'),
  text('purchaseId', 'Purchase ID'),
  text('transition', 'Transition'),
  text('fromBucket', 'From bucket'),
  text('toBucket', 'To bucket'),
  text('categoryCode', 'Category'),
  money('amount', 'Amount'),
  text('source', 'Source'),
  date('weekStart', 'Budget week'),
  date('monthStart', 'Budget month')]

},
{
  id: 'evaluations',
  name: 'Policy decisions',
  description: "Every time the user's rules checked a cart, including BLOCKED attempts that never became purchases.",
  fields: [
  dateTime('evaluatedAt', 'Checked'),
  text('merchant', 'Merchant'),
  text('decision', 'Decision', 'ALLOWED, REQUIRES_APPROVAL or BLOCKED'),
  text('primaryReasonCode', 'Main reason', 'The rule that decided, e.g. MERCHANT_NOT_APPROVED, APPROVAL_THRESHOLD_EXCEEDED'),
  money('amount', 'Cart total'),
  text('categories', 'Categories'),
  text('requestedBy', 'Requested by', 'AGENT or USER')]

},
{
  id: 'budgets',
  name: 'Budgets',
  description: 'Current week and month budgets: limit, spent (captured), pending (reserved/authorized) and remaining.',
  fields: [
  text('scope', 'Scope', 'CATEGORY or OVERALL'),
  text('categoryCode', 'Category'),
  text('period', 'Period', 'WEEKLY or MONTHLY'),
  date('periodStart', 'Period start'),
  money('limit', 'Limit'),
  money('spent', 'Spent'),
  money('pending', 'Pending'),
  money('remaining', 'Remaining')]

},
{
  id: 'merchants',
  name: 'Merchants',
  description: 'Merchants in the catalogue and their status under the current rules.',
  fields: [text('merchant', 'Merchant'), text('status', 'Status', 'APPROVED, BLOCKED or NEW'), text('categories', 'Categories')]
}];


const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** API rows → Studio rows: dates become Date objects, arrays become readable text, "Overall" budgets get a label. */
function toStudioRow(raw: Record<string, unknown>, spec: TableSpec): Record<string, string | number | boolean | Date | null> {
  const out: Record<string, string | number | boolean | Date | null> = {};
  for (const field of spec.fields) {
    const source = field.id === 'categories' ? raw.categoryCodes : raw[field.id];
    let value: unknown = source;
    if (Array.isArray(value)) value = value.join(', ');
    if ((field.format === 'dateFormat' || field.format === 'dateTimeFormat') && typeof value === 'string') {
      value = DATE_ONLY.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
    }
    if (field.id === 'categoryCode' && spec.id === 'budgets' && value == null) value = 'OVERALL';
    out[field.id] = value === undefined ? null : (value as string | number | boolean | Date | null);
  }
  return out;
}

export function buildDataSources(datasets: InsightDatasets): AgDataSourcesDefinition {
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: datasets.currency, minimumFractionDigits: 2 });
  return {
    description: `The signed-in user's own spending in Guardrail (${datasets.currency}), from ${datasets.from.slice(0, 10)} to ${datasets.to.slice(0, 10)}. Fictional sandbox merchants; no personal or payment identifiers.`,
    sources: tableSpecs.map((spec) => ({
      id: spec.id,
      name: spec.name,
      description: spec.description,
      primaryKeyField: spec.primaryKeyField,
      data: datasets[spec.id].map((r) => toStudioRow(r, spec)),
      fields: spec.fields.map((f) => ({
        id: f.id,
        name: f.name,
        format: f.format,
        description: f.description,
        ...(f.format === 'currencyFormat' ? { formatOptions: { format: currency } } : {})
      }))
    }))
  } as AgDataSourcesDefinition;
}
