import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api, requestWithStatus } from './api';
import {
  AgentMessageSchema,
  AgentTurnSchema,
  ApprovalDecisionSchema,
  ApprovalSchema,
  CategorySchema,
  CheckoutResponseSchema,
  ConversationSchema,
  DashboardOverviewSchema,
  LedgerEntrySchema,
  LedgerSummarySchema,
  MerchantChangeSchema,
  MerchantSchema,
  PolicyDocumentSchema,
  PolicyVersionSummarySchema,
  PurchaseSchema,
  SpendingProfileSchema,
  TransactionSchema,
  paged,
  type PolicyDocument,
} from './schemas';
import { useAuth } from '../contexts/AuthContext';

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  policies: ['policies'] as const,
  policyVersions: ['policies', 'versions'] as const,
  profile: ['profile'] as const,
  categories: ['categories'] as const,
  merchants: ['merchants'] as const,
  approvals: (status: string) => ['approvals', status] as const,
  approval: (id: string) => ['approval', id] as const,
  purchase: (id: string) => ['purchase', id] as const,
  transactions: (filters: object) => ['transactions', filters] as const,
  ledger: (filters: object) => ['ledger', filters] as const,
  ledgerSummary: (period: string) => ['ledger', 'summary', period] as const,
  conversations: ['conversations'] as const,
  messages: (id: string) => ['conversation', id, 'messages'] as const,
};

/** FRONTEND_SPECIFICATION.md §4: after approve/reject/checkout/capture, money views must refetch. */
export function invalidateMoney(client: QueryClient) {
  return Promise.all(
    [['dashboard'], ['approvals'], ['approval'], ['purchase'], ['ledger'], ['transactions'], ['conversation']].map((queryKey) =>
      client.invalidateQueries({ queryKey }),
    ),
  );
}

function useAuthed() {
  return useAuth().status === 'authenticated';
}

// ------------------------------------------------------------------ reads

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api('/dashboard/overview', { schema: DashboardOverviewSchema }),
    enabled: useAuthed(),
    staleTime: 30_000,
  });
}

export function usePolicy() {
  return useQuery({ queryKey: queryKeys.policies, queryFn: () => api('/policies', { schema: PolicyDocumentSchema }), enabled: useAuthed() });
}

export function usePolicyVersions() {
  return useQuery({
    queryKey: queryKeys.policyVersions,
    queryFn: () => api('/policies/versions', { query: { pageSize: 20 }, schema: paged(PolicyVersionSummarySchema) }),
    enabled: useAuthed(),
  });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: () => api('/spending-profile', { schema: SpendingProfileSchema }), enabled: useAuthed() });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api('/categories', { schema: z.array(CategorySchema) }),
    enabled: useAuthed(),
    staleTime: Infinity,
  });
}

export function useMerchants() {
  return useQuery({ queryKey: queryKeys.merchants, queryFn: () => api('/merchants', { schema: z.array(MerchantSchema) }), enabled: useAuthed() });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: queryKeys.approvals('PENDING'),
    queryFn: () => api('/approvals', { query: { status: 'PENDING' }, schema: z.array(ApprovalSchema) }),
    enabled: useAuthed(),
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });
}

export function useAllApprovals() {
  return useQuery({
    queryKey: queryKeys.approvals('ALL'),
    queryFn: () => api('/approvals', { schema: z.array(ApprovalSchema) }),
    enabled: useAuthed(),
  });
}

export function useApproval(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.approval(id ?? ''),
    queryFn: () => api(`/approvals/${id}`, { schema: ApprovalSchema }),
    enabled: useAuthed() && !!id,
  });
}

export function usePurchase(id: string | null | undefined, options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.purchase(id ?? ''),
    queryFn: () => api(`/purchases/${id}`, { schema: PurchaseSchema }),
    enabled: useAuthed() && !!id,
    refetchInterval: options.poll ? 2_000 : false,
  });
}

export interface TransactionFilters {
  status?: string;
  from?: string;
  page: number;
  pageSize: number;
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => api('/transactions', { query: { ...filters, sort: '-createdAt' }, schema: paged(TransactionSchema) }),
    enabled: useAuthed(),
    placeholderData: (previous) => previous,
  });
}

export function useLedgerEntries(filters: { purchaseId?: string; from?: string; page?: number; pageSize?: number }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ledger(filters),
    queryFn: () => api('/ledger/entries', { query: { pageSize: 100, ...filters }, schema: paged(LedgerEntrySchema) }),
    enabled: useAuthed() && enabled,
  });
}

export function useLedgerSummary(period: 'WEEKLY' | 'MONTHLY' = 'WEEKLY') {
  return useQuery({
    queryKey: queryKeys.ledgerSummary(period),
    queryFn: () => api('/ledger/summary', { query: { period }, schema: LedgerSummarySchema }),
    enabled: useAuthed(),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => api('/agent/conversations', { schema: z.array(ConversationSchema) }),
    enabled: useAuthed(),
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId ?? ''),
    queryFn: () => api(`/agent/conversations/${conversationId}/messages`, { schema: z.array(AgentMessageSchema) }),
    enabled: useAuthed() && !!conversationId,
  });
}

// ------------------------------------------------------------------ writes

export function useSavePolicy() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { expectedVersionNumber: number; changeSummary?: string; policy: PolicyDocument }) =>
      api('/policies', { method: 'PUT', body: input, schema: PolicyDocumentSchema }),
    onSuccess: (policy) => {
      client.setQueryData(queryKeys.policies, policy);
      void client.invalidateQueries({ queryKey: queryKeys.policyVersions });
      void client.invalidateQueries({ queryKey: queryKeys.merchants });
      void invalidateMoney(client);
    },
  });
}

export function useMerchantAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, expectedVersionNumber }: { id: string; action: 'approve' | 'block' | 'reset'; expectedVersionNumber: number }) =>
      api(`/merchants/${id}/${action}`, { method: 'POST', body: { expectedVersionNumber }, schema: MerchantChangeSchema }),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.merchants });
      void client.invalidateQueries({ queryKey: queryKeys.policies });
      void client.invalidateQueries({ queryKey: queryKeys.policyVersions });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useApprove() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cartSnapshotHash, password }: { id: string; cartSnapshotHash: string; password: string }) =>
      api(`/approvals/${id}/approve`, { method: 'POST', body: { cartSnapshotHash, password }, schema: ApprovalDecisionSchema }),
    onSuccess: () => invalidateMoney(client),
  });
}

export function useReject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api(`/approvals/${id}/reject`, { method: 'POST', body: { reason }, schema: ApprovalDecisionSchema }),
    onSuccess: () => invalidateMoney(client),
  });
}

export function useCheckout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, idempotencyKey }: { purchaseId: string; idempotencyKey: string }) =>
      api(`/purchases/${purchaseId}/checkout`, { method: 'POST', idempotencyKey, schema: CheckoutResponseSchema }),
    onSettled: () => invalidateMoney(client),
  });
}

/** 200 → PurchaseDto (COMPLETED / CAPTURE_PENDING); 202 → CAPTURE_IN_PROGRESS problem body. */
export function capturePurchase(purchaseId: string, idempotencyKey: string) {
  return requestWithStatus<unknown>(`/purchases/${purchaseId}/capture`, { method: 'POST', idempotencyKey });
}

export function useCancelPurchase() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (purchaseId: string) => api(`/purchases/${purchaseId}/cancel`, { method: 'POST', schema: PurchaseSchema }),
    onSettled: () => invalidateMoney(client),
  });
}

export function useCreateConversation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => api('/agent/conversations', { method: 'POST', body: { title }, schema: ConversationSchema }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.conversations }),
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api(`/agent/conversations/${conversationId}/messages`, { method: 'POST', body: { content }, schema: AgentTurnSchema }),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.conversations });
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
      void client.invalidateQueries({ queryKey: ['approvals'] });
      void client.invalidateQueries({ queryKey: ['ledger'] });
    },
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (timeZone: string) => api('/spending-profile', { method: 'PATCH', body: { timeZone }, schema: SpendingProfileSchema }),
    onSuccess: (profile) => {
      client.setQueryData(queryKeys.profile, profile);
      void client.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDemoReset() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api('/admin/demo/reset', { method: 'POST' }),
    onSuccess: () => client.invalidateQueries(),
  });
}
