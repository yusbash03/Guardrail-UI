import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function EmptyOverview() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex max-w-[1280px] px-4 py-10 lg:px-8 lg:py-16">
      <Card className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">Set your first rule</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your AI assistant can't shop until you tell it how. Start with a weekly budget — you can add merchants and limits after.
        </p>
        <Button size="lg" className="mt-6" onClick={() => navigate('/rules')}>
          Set your first rule
        </Button>
      </Card>
    </div>);

}