import { BadgeCheck, LayoutDashboard, LucideIcon, ReceiptText, Settings, ShieldCheck, Sparkles, Store } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
{ to: '/', label: 'Overview', icon: LayoutDashboard },
{ to: '/shop', label: 'AI Shopping', icon: Sparkles },
{ to: '/rules', label: 'Spending Rules', icon: ShieldCheck },
{ to: '/merchants', label: 'Merchants', icon: Store },
{ to: '/approvals', label: 'Purchase Approvals', icon: BadgeCheck },
{ to: '/transactions', label: 'Transactions', icon: ReceiptText },
{ to: '/settings', label: 'Settings', icon: Settings }];


export const mobileTabs: NavItem[] = [
{ to: '/', label: 'Overview', icon: LayoutDashboard },
{ to: '/shop', label: 'Shop', icon: Sparkles },
{ to: '/approvals', label: 'Approvals', icon: BadgeCheck },
{ to: '/transactions', label: 'Activity', icon: ReceiptText }];


export const moreItems: NavItem[] = [
{ to: '/rules', label: 'Spending Rules', icon: ShieldCheck },
{ to: '/merchants', label: 'Merchants', icon: Store },
{ to: '/settings', label: 'Settings', icon: Settings }];


export const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/shop': 'AI Shopping',
  '/rules': 'Spending Rules',
  '/merchants': 'Merchants',
  '/approvals': 'Purchase Approvals',
  '/transactions': 'Transactions',
  '/settings': 'Settings',
  '/components': 'Component sheet'
};