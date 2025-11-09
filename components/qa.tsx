import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface QAProps {
  question: string;
  children: ReactNode;
}

export function QA({ question, children }: QAProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
        <span className="text-lg font-semibold">{question}</span>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}