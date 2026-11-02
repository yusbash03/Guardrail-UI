export type ReasonSeverity = 'INFO' | 'APPROVAL' | 'BLOCK';

export interface Reason {
  id: string;
  severity: ReasonSeverity;
  message: string;
  ruleType: string;
  detail: string;
}