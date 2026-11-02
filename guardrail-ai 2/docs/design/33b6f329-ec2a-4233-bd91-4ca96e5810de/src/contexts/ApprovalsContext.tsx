import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalsContextValue {
  status: ApprovalStatus;
  pendingCount: number;
  approve: () => void;
  reject: () => void;
}

const ApprovalsContext = createContext<ApprovalsContextValue>({
  status: 'pending',
  pendingCount: 1,
  approve: () => undefined,
  reject: () => undefined
});

export function ApprovalsProvider({ children }: {children: ReactNode;}) {
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  return (
    <ApprovalsContext.Provider
      value={{
        status,
        pendingCount: status === 'pending' ? 1 : 0,
        approve: () => setStatus('approved'),
        reject: () => setStatus('rejected')
      }}>
      
      {children}
    </ApprovalsContext.Provider>);

}

export function useApprovals() {
  return useContext(ApprovalsContext);
}