import { z } from 'zod';

// Wire contracts (docs/api/API_CONTRACT.md, backend Dtos.cs). Every API response is parsed here at the boundary.
// Money is a 2-dp decimal string; enums are UPPER_SNAKE strings.

const money = z.string();
const id = z.string();
const timestamp = z.string();

export const UserSchema = z.object({ id, email: z.string(), displayName: z.string(), role: z.enum(['USER', 'ADMIN']) });
export const AuthResponseSchema = z.object({ accessToken: z.string(), expiresAt: timestamp, user: UserSchema });

export const SpendingProfileSchema = z.object({ id, currency: z.string(), timeZone: z.string(), currentPolicyVersionNumber: z.number() });

export const MerchantStatusSchema = z.enum(['APPROVED', 'BLOCKED', 'NEW']);
export const MerchantSchema = z.object({
  id,
  slug: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  logoUrl: z.string().nullish(),
  categoryCodes: z.array(z.string()),
  status: MerchantStatusSchema,
  productCount: z.number(),
});
export const MerchantChangeSchema = z.object({ merchant: MerchantSchema, policyVersionNumber: z.number() });

export const CategorySchema = z.object({ code: z.string(), name: z.string() });

export const ProductSchema = z.object({
  id,
  merchantId: id,
  merchantName: z.string(),
  merchantStatus: MerchantStatusSchema,
  sku: z.string(),
  name: z.string(),
  brand: z.string().nullish(),
  categoryCode: z.string(),
  tags: z.array(z.string()),
  unitPrice: money,
  currency: z.string(),
  unitLabel: z.string().nullish(),
  imageUrl: z.string().nullish(),
  isAvailable: z.boolean(),
  stockQuantity: z.number(),
  description: z.string().nullish(),
});

export const CartItemSchema = z.object({
  productId: id,
  name: z.string(),
  sku: z.string(),
  categoryCode: z.string(),
  unitPrice: money,
  quantity: z.number(),
  lineTotal: money,
});

export const CartSchema = z.object({
  id,
  version: z.number(),
  status: z.enum(['OPEN', 'LOCKED', 'CHECKED_OUT', 'ABANDONED']),
  merchantId: id,
  merchantName: z.string(),
  currency: z.string(),
  items: z.array(CartItemSchema),
  subtotal: money,
  total: money,
  createdBy: z.string(),
  snapshotHash: z.string(),
  updatedAt: timestamp,
});

export const ReasonSeveritySchema = z.enum(['BLOCK', 'REQUIRE_APPROVAL', 'INFO']);
export const PolicyReasonSchema = z.object({
  code: z.string(),
  severity: ReasonSeveritySchema,
  message: z.string(),
  ruleType: z.string().nullish(),
  ruleId: z.string().nullish(),
  details: z.record(z.string().nullable()).nullish(),
});

export const BudgetImpactSchema = z.object({
  scope: z.enum(['CATEGORY', 'OVERALL']),
  categoryCode: z.string().nullish(),
  period: z.enum(['WEEKLY', 'MONTHLY']),
  periodStart: z.string(),
  limit: money,
  committedBefore: money,
  purchaseAmount: money,
  remainingBefore: money,
  remainingAfter: money,
  exceeded: z.boolean(),
});

export const DecisionSchema = z.enum(['ALLOWED', 'REQUIRES_APPROVAL', 'BLOCKED']);

export const PolicyDecisionSchema = z.object({
  evaluationId: id,
  decision: DecisionSchema,
  isAllowed: z.boolean(),
  requiresApproval: z.boolean(),
  reason: z.string(),
  reasonCode: z.string(),
  purchaseAmount: money,
  remainingBudget: money.nullish(),
  currency: z.string(),
  policyVersionId: id,
  policyVersionNumber: z.number(),
  cartId: id,
  cartVersion: z.number(),
  cartSnapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  reasons: z.array(PolicyReasonSchema),
  budgetImpacts: z.array(BudgetImpactSchema),
  evaluatedAt: timestamp,
});

export const PurchaseStatusSchema = z.enum([
  'AWAITING_APPROVAL',
  'READY_FOR_CHECKOUT',
  'CHECKOUT_PENDING',
  'PAYER_APPROVED',
  'PAYMENT_AUTHORIZED',
  'CAPTURE_PENDING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);
export const ApprovalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'INVALIDATED', 'CONSUMED']);
export const PaymentStatusSchema = z.string();

export const FinalCheckSchema = z.object({
  passed: z.boolean(),
  reasons: z.array(z.object({ code: z.string(), message: z.string() })),
  checkedAt: timestamp,
});

export const PurchaseSchema = z.object({
  id,
  status: PurchaseStatusSchema,
  amount: money,
  currency: z.string(),
  merchantId: id,
  merchantName: z.string(),
  cartId: id,
  cartVersion: z.number(),
  cartSnapshotHash: z.string(),
  policyVersionNumber: z.number(),
  decision: DecisionSchema,
  approval: z.object({ id, status: ApprovalStatusSchema, expiresAt: timestamp }).nullish(),
  payment: z
    .object({
      status: PaymentStatusSchema,
      paypalOrderId: z.string().nullish(),
      paypalAuthorizationId: z.string().nullish(),
      paypalCaptureId: z.string().nullish(),
      finalCheck: FinalCheckSchema.nullish(),
    })
    .nullish(),
  items: z.array(CartItemSchema),
  createdAt: timestamp,
  completedAt: timestamp.nullish(),
  failureCode: z.string().nullish(),
});

export const ApprovalSchema = z.object({
  id,
  status: ApprovalStatusSchema,
  purchaseId: id,
  amount: money,
  currency: z.string(),
  merchantId: id,
  merchantName: z.string(),
  cartSnapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  policyVersionNumber: z.number(),
  reasons: z.array(PolicyReasonSchema),
  budgetImpacts: z.array(BudgetImpactSchema),
  items: z.array(CartItemSchema),
  requestedBy: z.string(),
  createdAt: timestamp,
  expiresAt: timestamp,
  decidedAt: timestamp.nullish(),
  invalidatedReason: z.string().nullish(),
});

export const ApprovalDecisionSchema = z.object({ approval: ApprovalSchema, purchase: PurchaseSchema });

export const CheckoutResponseSchema = z.object({
  purchaseId: id,
  purchaseStatus: PurchaseStatusSchema,
  paypalOrderId: z.string().nullish(),
  approveUrl: z.string().nullish(),
});

export const LedgerCategorySummarySchema = z.object({
  categoryCode: z.string(),
  period: z.enum(['WEEKLY', 'MONTHLY']),
  limit: money.nullish(),
  spent: money,
  pending: money,
  remaining: money.nullish(),
});

export const LedgerSummarySchema = z.object({
  period: z.enum(['WEEKLY', 'MONTHLY']),
  periodStart: z.string(),
  periodEnd: z.string(),
  currency: z.string(),
  categories: z.array(LedgerCategorySummarySchema),
  overall: z.object({ limit: money.nullish(), spent: money, pending: money, remaining: money.nullish() }),
});

export const LedgerEntrySchema = z.object({
  id,
  purchaseId: id,
  paymentId: id.nullish(),
  categoryCode: z.string(),
  amount: money,
  currency: z.string(),
  transition: z.string(),
  fromBucket: z.string(),
  toBucket: z.string(),
  budgetWeekStart: z.string(),
  budgetMonthStart: z.string(),
  source: z.string(),
  externalRef: z.string(),
  occurredAt: timestamp,
});

export const TransactionSchema = z.object({
  purchaseId: id,
  status: PurchaseStatusSchema,
  amount: money,
  currency: z.string(),
  merchantId: id,
  merchantName: z.string(),
  approvalStatus: ApprovalStatusSchema.nullish(),
  paymentStatus: PaymentStatusSchema.nullish(),
  paypalOrderId: z.string().nullish(),
  paypalAuthorizationId: z.string().nullish(),
  paypalCaptureId: z.string().nullish(),
  failureCode: z.string().nullish(),
  createdAt: timestamp,
  completedAt: timestamp.nullish(),
});

export const PeriodOverviewSchema = z.object({
  periodStart: z.string(),
  limit: money.nullish(),
  spent: money,
  pending: money,
  remaining: money.nullish(),
});

export const DashboardOverviewSchema = z.object({
  currency: z.string(),
  weekly: PeriodOverviewSchema,
  monthly: PeriodOverviewSchema,
  categories: z.array(LedgerCategorySummarySchema),
  pendingApprovals: z.number(),
  recentPurchases: z.array(PurchaseSchema),
  insights: z.array(z.object({ kind: z.string(), severity: z.string(), text: z.string() })),
});

export const RuleActionSchema = z.enum(['ALLOW', 'REQUIRE_APPROVAL', 'BLOCK']);

export const PolicyDocumentSchema = z.object({
  policyVersionId: id.nullish(),
  versionNumber: z.number().nullish(),
  currency: z.string().nullish(),
  timeZone: z.string().nullish(),
  approvalThreshold: z.object({ amount: money }).nullish(),
  maxTransactionAmount: z.object({ amount: money }).nullish(),
  spendingLimits: z.array(z.object({ period: z.enum(['WEEKLY', 'MONTHLY']), limit: money })),
  categoryBudgets: z.array(z.object({ categoryCode: z.string(), period: z.enum(['WEEKLY', 'MONTHLY']), limit: money })),
  merchantRules: z.object({
    approvedMerchantIds: z.array(id),
    blockedMerchantIds: z.array(id),
    newMerchantAction: RuleActionSchema,
  }),
  productRestrictions: z.array(
    z.object({
      id: z.string().nullish(),
      match: z.object({ type: z.enum(['PRODUCT', 'CATEGORY', 'TAG']), value: z.string() }),
      action: RuleActionSchema,
      note: z.string().nullish(),
    }),
  ),
  duplicatePurchase: z
    .object({ enabled: z.boolean(), windowHours: z.number(), scope: z.enum(['SAME_PRODUCT', 'SAME_CART']), action: RuleActionSchema })
    .nullish(),
  timeRestrictions: z.array(
    z.object({
      id: z.string().nullish(),
      daysOfWeek: z.array(z.string()),
      startLocalTime: z.string(),
      endLocalTime: z.string(),
      action: RuleActionSchema,
    }),
  ),
  unbudgetedCategoryAction: RuleActionSchema,
});

export const PolicyVersionSummarySchema = z.object({
  versionNumber: z.number(),
  policyVersionId: id,
  changeSummary: z.string(),
  createdAt: timestamp,
  snapshotHash: z.string(),
});

export const ConversationSchema = z.object({
  id,
  title: z.string(),
  status: z.string().optional(),
  lastMessageAt: timestamp.nullish(),
  createdAt: timestamp,
});

export const HydratedCardSchema = z.object({
  type: z.string(),
  id: id.nullish(),
  ids: z.array(id).nullish(),
  data: z.unknown(),
});

export const AgentMessageSchema = z.object({
  id,
  sequence: z.number(),
  role: z.enum(['USER', 'ASSISTANT', 'TOOL']),
  content: z.string(),
  cards: z.array(HydratedCardSchema).nullish(),
  createdAt: timestamp.optional(),
});

export const ToolCallSchema = z.object({
  name: z.string(),
  status: z.enum(['SUCCEEDED', 'REJECTED', 'FAILED']),
  durationMs: z.number(),
  errorCode: z.string().nullish(),
});

export const AgentTurnSchema = z.object({
  conversationId: id,
  userMessage: AgentMessageSchema,
  assistantMessage: AgentMessageSchema,
  toolCalls: z.array(ToolCallSchema),
  limits: z.object({
    llmRequestsUsed: z.number(),
    llmRequestsMax: z.number(),
    toolCallsUsed: z.number(),
    toolCallsMax: z.number(),
    provider: z.string().nullish(),
  }),
  code: z.string().nullish(),
});

export const ProblemSchema = z.object({
  code: z.string().optional(),
  status: z.number().optional(),
  title: z.string().optional(),
  detail: z.string().nullish(),
  data: z.record(z.unknown()).nullish(),
  errors: z.record(z.array(z.string())).nullish(),
});

export function paged<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), page: z.number(), pageSize: z.number(), totalCount: z.number() });
}

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type SpendingProfile = z.infer<typeof SpendingProfileSchema>;
export type MerchantDto = z.infer<typeof MerchantSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type PolicyReason = z.infer<typeof PolicyReasonSchema>;
export type BudgetImpact = z.infer<typeof BudgetImpactSchema>;
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;
export type PurchaseStatus = z.infer<typeof PurchaseStatusSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type PurchaseDto = z.infer<typeof PurchaseSchema>;
export type ApprovalDto = z.infer<typeof ApprovalSchema>;
export type LedgerSummary = z.infer<typeof LedgerSummarySchema>;
export type LedgerEntryDto = z.infer<typeof LedgerEntrySchema>;
export type TransactionDto = z.infer<typeof TransactionSchema>;
export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
export type RuleActionCode = z.infer<typeof RuleActionSchema>;
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;
export type PolicyVersionSummary = z.infer<typeof PolicyVersionSummarySchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type HydratedCard = z.infer<typeof HydratedCardSchema>;
export type AgentMessage = z.infer<typeof AgentMessageSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type AgentTurn = z.infer<typeof AgentTurnSchema>;
export type Paged<T> = { items: T[]; page: number; pageSize: number; totalCount: number };
