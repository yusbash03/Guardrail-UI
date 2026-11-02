import type { Merchant } from '../types/merchant';

export const merchants: Merchant[] = [
{ id: 'freshmart', name: 'FreshMart', initials: 'FM', hue: 152, categories: ['Groceries', 'Household'], status: 'APPROVED', productCount: 18 },
{ id: 'greengrocer', name: 'GreenGrocer Co.', initials: 'GG', hue: 96, categories: ['Groceries'], status: 'APPROVED', productCount: 14 },
{ id: 'homebasics', name: 'HomeBasics', initials: 'HB', hue: 28, categories: ['Household', 'Personal care'], status: 'NEW', productCount: 12 },
{ id: 'quickcart', name: 'QuickCart Express', initials: 'QE', hue: 268, categories: ['Groceries', 'Alcohol'], status: 'NEW', productCount: 10 },
{ id: 'technest', name: 'TechNest', initials: 'TN', hue: 205, categories: ['Electronics'], status: 'BLOCKED', productCount: 8 }];