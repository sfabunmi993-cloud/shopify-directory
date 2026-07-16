import React, { useState } from 'react';
import { User, Mail, Globe, Tag, DollarSign, Store, Code, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContactDetailsCard({ message }) {
  const [expanded, setExpanded] = useState(false);

  // Only show if there's contact info on this message
  const hasContactInfo = message?.client_full_name || message?.client_email || message?.client_country ||
    message?.client_service || message?.client_budget || message?.client_store_url || message?.collaborator_code;

  if (!hasContactInfo) return null;

  const fields = [
    message?.client_full_name && { icon: User, label: 'Full name', value: message.client_full_name },
    message?.client_email && { icon: Mail, label: 'Email', value: message.client_email },
    message?.client_country && { icon: Globe, label: 'Country', value: message.client_country },
    message?.client_service && { icon: Tag, label: 'Service', value: message.client_service },
    message?.client_budget && { icon: DollarSign, label: 'Budget', value: `$${message.client_budget}` },
    message?.client_store_url && { icon: Store, label: 'Store', value: message.client_store_url, isLink: true },
    message?.collaborator_code && { icon: Code, label: 'Collaborator code', value: message.collaborator_code },
  ].filter(Boolean);

  return (
    <div className="mx-2 sm:mx-4 mb-3 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/10 transition-colors"
      >
        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Contact Details
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {fields.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">{f.label}</p>
                  {f.isLink ? (
                    <a href={f.value} target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary hover:underline break-all">
                      {f.value}
                    </a>
                  ) : (
                    <p className="text-foreground font-medium break-words">{f.value}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}