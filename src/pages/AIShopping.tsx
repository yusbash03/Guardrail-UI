import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationList } from '../components/shopping/ConversationList';
import { BudgetRail, MobileBudgetStrip } from '../components/shopping/BudgetRail';
import { AssistantMessage, TypingIndicator, UserMessage } from '../components/shopping/ChatMessage';
import { AgentCards } from '../components/shopping/AgentCards';
import { Composer } from '../components/shopping/Composer';
import { ToolTrace } from '../components/ToolTrace';
import { StepUpDialog } from '../components/StepUpDialog';
import { useStartCheckout } from '../hooks/useStartCheckout';
import { useOnline } from '../hooks/useOnline';
import { useConversations, useCreateConversation, useMessages, useReject, useSendMessage, queryKeys } from '../lib/queries';
import { api } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import { AgentTurnSchema, type AgentMessage, type ApprovalDto, type PurchaseDto, type ToolCall } from '../lib/schemas';
import { toolLabel } from '../utils/labels';
import { formatShortTime } from '../utils/time';

const SEPARATOR_GAP_MS = 10 * 60 * 1000;

function separatorLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date().toDateString() === date.toDateString();
  return today ? `Today · ${formatShortTime(iso)}` : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${formatShortTime(iso)}`;
}

function toolSteps(calls: ToolCall[]) {
  const grouped = new Map<string, { count: number; failed: number; ms: number }>();
  calls.forEach((c) => {
    const g = grouped.get(c.name) ?? { count: 0, failed: 0, ms: 0 };
    grouped.set(c.name, { count: g.count + 1, failed: g.failed + (c.status === 'SUCCEEDED' ? 0 : 1), ms: g.ms + c.durationMs });
  });
  return [...grouped.entries()].map(([name, g]) => ({
    label: toolLabel(name),
    detail: `${g.count > 1 ? `${g.count} calls · ` : ''}${g.failed ? `${g.failed} rejected · ` : ''}${g.ms} ms`,
  }));
}

/** Plain text with paragraph breaks — never HTML (DESIGN_SYSTEM.md AgentMessage). */
function MessageText({ text }: { text: string }) {
  return <p className="whitespace-pre-line text-[15px] leading-relaxed">{text}</p>;
}

export function AIShopping() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const online = useOnline();
  const conversations = useConversations();
  const messages = useMessages(conversationId);
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage(conversationId);
  const reject = useReject();
  const checkout = useStartCheckout();
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [toolCalls, setToolCalls] = useState<Record<string, ToolCall[]>>({});
  const [stepUp, setStepUp] = useState<ApprovalDto | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // /shop opens the most recent conversation, if there is one.
  useEffect(() => {
    if (!conversationId && conversations.data && conversations.data.length > 0) {
      navigate(`/shop/${conversations.data[0].id}`, { replace: true });
    }
  }, [conversationId, conversations.data, navigate]);

  const thread: AgentMessage[] = (messages.data ?? []).filter((m) => m.role !== 'TOOL');
  const typing = pendingText !== null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread.length, typing]);

  const appendTurn = (id: string, turn: { userMessage: AgentMessage; assistantMessage: AgentMessage; toolCalls: ToolCall[] }) => {
    queryClient.setQueryData<AgentMessage[]>(queryKeys.messages(id), (old = []) => [
      ...old.filter((m) => m.id !== turn.userMessage.id && m.id !== turn.assistantMessage.id),
      turn.userMessage,
      turn.assistantMessage,
    ]);
    if (turn.toolCalls.length) setToolCalls((t) => ({ ...t, [turn.assistantMessage.id]: turn.toolCalls }));
  };

  const send = async (text: string) => {
    setPendingText(text);
    try {
      if (conversationId) {
        appendTurn(conversationId, await sendMessage.mutateAsync(text));
      } else {
        // First message: create the conversation, post to it, then move to its URL.
        const conversation = await createConversation.mutateAsync(text.slice(0, 60));
        const turn = await api(`/agent/conversations/${conversation.id}/messages`, { method: 'POST', body: { content: text }, schema: AgentTurnSchema });
        appendTurn(conversation.id, turn);
        void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        navigate(`/shop/${conversation.id}`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPendingText(null);
    }
  };

  const newChat = () =>
  createConversation.mutate(undefined, {
    onSuccess: (c) => navigate(`/shop/${c.id}`),
    onError: (err) => toast.error(errorMessage(err))
  });

  const refreshThread = () => conversationId && void queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });

  const handleReject = (approval: ApprovalDto) =>
  reject.mutate(
    { id: approval.id },
    {
      onSuccess: () => {
        toast('Cart rejected — nothing was charged');
        refreshThread();
      },
      onError: (err) => toast.error(errorMessage(err))
    }
  );

  const handleConfirmed = (purchase: PurchaseDto) => {
    setStepUp(null);
    refreshThread();
    if (purchase.status === 'READY_FOR_CHECKOUT') {
      toast.success('Approved — taking you to PayPal');
      checkout.start(purchase.id);
    }
  };

  return (
    <div className="flex h-full">
      <ConversationList
        conversations={conversations.data ?? []}
        activeId={conversationId}
        onSelect={(id) => navigate(`/shop/${id}`)}
        onNew={newChat}
        creating={createConversation.isPending && !typing} />

      <section aria-label="Chat" className="flex min-w-0 flex-1 flex-col">
        <MobileBudgetStrip />
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 lg:px-6" aria-live="polite">
            {thread.length === 0 && !typing &&
            <div className="flex flex-col items-center py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">{messages.isLoading ? 'Loading conversation…' : 'What should I shop for?'}</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  I'll build carts that follow your{' '}
                  <Link to="/rules" className="font-medium text-primary-ink underline-offset-2 hover:underline">
                    Spending Rules
                  </Link>
                  . You approve every one before anything is paid.
                </p>
              </div>
            }

            {thread.map((message, index) => {
              const previous = thread[index - 1];
              const showSeparator =
              message.createdAt && (
              !previous?.createdAt || new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() > SEPARATOR_GAP_MS);
              return (
                <Fragment key={message.id}>
                  {showSeparator && message.createdAt && <p className="text-center text-xs text-muted-foreground">{separatorLabel(message.createdAt)}</p>}
                  {message.role === 'USER' ?
                  <UserMessage>{message.content}</UserMessage> :

                  <AssistantMessage>
                      <MessageText text={message.content} />
                      {toolCalls[message.id] && <ToolTrace steps={toolSteps(toolCalls[message.id])} />}
                      <AgentCards
                      cards={message.cards ?? []}
                      onApprove={setStepUp}
                      onReject={handleReject}
                      rejectingId={reject.isPending ? reject.variables?.id : null}
                      onPay={checkout.start}
                      paying={checkout.pending} />

                    </AssistantMessage>
                  }
                </Fragment>);

            })}
            {pendingText !== null && <UserMessage>{pendingText}</UserMessage>}
            {typing && <TypingIndicator />}
          </div>
        </div>
        <Composer onSend={(text) => void send(text)} disabled={typing || !online} />
      </section>
      <BudgetRail />
      <StepUpDialog approval={stepUp} onClose={() => setStepUp(null)} onConfirmed={handleConfirmed} />
    </div>);

}
