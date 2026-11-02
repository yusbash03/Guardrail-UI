import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConversationList } from '../components/shopping/ConversationList';
import { BudgetRail, MobileBudgetStrip } from '../components/shopping/BudgetRail';
import { AssistantMessage, TypingIndicator, UserMessage } from '../components/shopping/ChatMessage';
import { CartCard } from '../components/shopping/CartCard';
import { EvaluationCard } from '../components/shopping/EvaluationCard';
import { ApprovalCard } from '../components/shopping/ApprovalCard';
import { Composer } from '../components/shopping/Composer';
import { ToolTrace } from '../components/ToolTrace';
import { BudgetBar } from '../components/BudgetBar';
import { MoneyText } from '../components/MoneyText';
import { StepUpDialog } from '../components/StepUpDialog';
import { useApprovals } from '../contexts/ApprovalsContext';
import { cannedReplies, chatScript, defaultReply, toolTraceSteps } from '../data/conversations';
import { approvalReasons, blockedReasons } from '../data/reasons';
import { approvalFingerprint, freshmartCartTotal, quickcartTotal } from '../data/cart';

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function AIShopping() {
  const [extra, setExtra] = useState<ChatEntry[]>([]);
  const [typing, setTyping] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { approve, reject } = useApprovals();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (extra.length === 0 && !typing) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [extra.length, typing]);

  const send = (text: string) => {
    setExtra((e) => [...e, { id: `u${e.length}`, role: 'user', text }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setExtra((e) => [...e, { id: `a${e.length}`, role: 'assistant', text: cannedReplies[text] ?? defaultReply }]);
    }, 900);
  };

  const handleReject = () => {
    reject();
    toast('Cart rejected — nothing was charged');
  };

  const handleConfirmed = () => {
    approve();
    setDialogOpen(false);
    navigate('/checkout/return');
  };

  return (
    <div className="flex h-full">
      <ConversationList />
      <section aria-label="Chat" className="flex min-w-0 flex-1 flex-col">
        <MobileBudgetStrip />
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 lg:px-6">
            <p className="text-center text-xs text-muted-foreground">Today · 2:01 PM</p>
            <UserMessage>{chatScript.groceriesRequest}</UserMessage>
            <AssistantMessage>
              <p className="text-[15px] leading-relaxed">{chatScript.groceriesReply}</p>
              <ToolTrace steps={toolTraceSteps} />
              <CartCard />
              <EvaluationCard decision="REQUIRES_APPROVAL" primaryReason="Purchase exceeds approval threshold" reasons={approvalReasons}>
                <BudgetBar
                  label="Groceries"
                  period="Weekly"
                  spent={0}
                  pending={freshmartCartTotal}
                  limit={80}
                  pendingLabel="This cart"
                  showLegend
                  rightLabel={
                  <>
                      $80.00 → <span className="font-semibold text-foreground">$37.00</span> after purchase
                    </>
                  } />
                
              </EvaluationCard>
              <ApprovalCard onApprove={() => setDialogOpen(true)} onReject={handleReject} />
            </AssistantMessage>

            <p className="text-center text-xs text-muted-foreground">2:11 PM</p>
            <UserMessage>{chatScript.snacksRequest}</UserMessage>
            <AssistantMessage>
              <p className="text-[15px] leading-relaxed">{chatScript.snacksReply}</p>
              <EvaluationCard
                decision="BLOCKED"
                primaryReason="QuickCart Express is not on your approved merchant list"
                reasons={blockedReasons}
                footer={
                <Link to="/merchants" className="text-sm font-medium text-primary-ink hover:underline">
                    Manage merchants
                  </Link>
                }>
                
                <div className="flex items-baseline justify-between rounded-btn bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Cart total · QuickCart Express</span>
                  <MoneyText amount={quickcartTotal} />
                </div>
              </EvaluationCard>
            </AssistantMessage>

            <UserMessage>{chatScript.overrideRequest}</UserMessage>
            <AssistantMessage>
              <p className="text-[15px] leading-relaxed">
                I can't override your rules — only you can change them in{' '}
                <Link to="/rules" className="font-medium text-primary-ink underline-offset-2 hover:underline">
                  Spending Rules
                </Link>
                .
              </p>
            </AssistantMessage>

            {extra.map((entry) =>
            entry.role === 'user' ?
            <UserMessage key={entry.id}>{entry.text}</UserMessage> :

            <AssistantMessage key={entry.id}>
                  <p className="text-[15px] leading-relaxed">{entry.text}</p>
                </AssistantMessage>

            )}
            {typing && <TypingIndicator />}
          </div>
        </div>
        <Composer onSend={send} disabled={typing} />
      </section>
      <BudgetRail />
      <StepUpDialog
        open={dialogOpen}
        amount={freshmartCartTotal}
        merchant="FreshMart"
        fingerprint={approvalFingerprint}
        onClose={() => setDialogOpen(false)}
        onConfirmed={handleConfirmed} />
      
    </div>);

}