import React, { ReactNode } from 'react';
import { Check, Pencil } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { SpendingRules } from '../../types/rules';
import type { Category } from '../../lib/schemas';

export interface RuleSectionsProps {
  rules: SpendingRules;
  update: (patch: Partial<SpendingRules>) => void;
  isEditing: (id: string) => boolean;
  toggleEdit: (id: string) => void;
  categories: Category[];
}

interface RuleSectionProps {
  id: string;
  title: string;
  description: string;
  editing: boolean;
  onToggleEdit: () => void;
  children: ReactNode;
}

export function RuleSection({ id, title, description, editing, onToggleEdit, children }: RuleSectionProps) {
  return (
    <Card id={id} className="scroll-mt-6 p-5 lg:p-6" aria-labelledby={`${id}-title`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={`${id}-title`} className="text-base font-semibold">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant={editing ? 'primary' : 'secondary'} size="sm" onClick={onToggleEdit} aria-label={`${editing ? 'Done editing' : 'Edit'} ${title}`}>
          {editing ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
          {editing ? 'Done' : 'Edit'}
        </Button>
      </div>
      <div className="mt-5">{children}</div>
    </Card>);

}