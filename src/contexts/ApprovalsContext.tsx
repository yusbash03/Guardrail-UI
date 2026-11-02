import React, { createContext, ReactNode, useContext } from 'react';
import { usePendingApprovals } from '../lib/queries';

interface ApprovalsContextValue {
  pendingCount: number;
}

const ApprovalsContext = createContext<ApprovalsContextValue>({ pendingCount: 0 });

/** Nav badge count from GET /approvals?status=PENDING, polled every 20 s while the tab is visible. */
export function ApprovalsProvider({ children }: { children: ReactNode }) {
  const { data } = usePendingApprovals();
  return <ApprovalsContext.Provider value={{ pendingCount: data?.length ?? 0 }}>{children}</ApprovalsContext.Provider>;
}

export function useApprovals() {
  return useContext(ApprovalsContext);
}
