export type MerchantStatus = 'APPROVED' | 'BLOCKED' | 'NEW';

export interface Merchant {
  id: string;
  name: string;
  initials: string;
  hue: number;
  categories: string[];
  status: MerchantStatus;
  productCount: number;
}