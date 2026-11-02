import type { PolicyDocument } from './schemas';

/** Number of configured rules shown on the Overview "Active rules" tile. */
export function countActiveRules(policy: PolicyDocument): number {
  return (
    policy.categoryBudgets.length +
    policy.spendingLimits.length +
    (policy.approvalThreshold ? 1 : 0) +
    (policy.maxTransactionAmount ? 1 : 0) +
    (policy.merchantRules.approvedMerchantIds.length > 0 ? 1 : 0) +
    (policy.merchantRules.blockedMerchantIds.length > 0 ? 1 : 0) +
    policy.productRestrictions.length +
    (policy.duplicatePurchase?.enabled ? 1 : 0) +
    policy.timeRestrictions.length
  );
}
