import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ServiceDescriptionEditor({ services = [], partnerName, serviceDescriptions = {}, onChange }) {
  const [expanded, setExpanded] = useState({});
  const [generating, setGenerating] = useState({});

  const toggleExpand = (service) => {
    setExpanded(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const handleDescChange = (service, value) => {
    onChange({ ...serviceDescriptions, [service]: value });
  };

  const generateDesc = async (service) => {
    setGenerating(prev => ({ ...prev, [service]: true }));
    if (!expanded[service]) setExpanded(prev => ({ ...prev, [service]: true }));
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, compelling 2-3 sentence service description for "${service}" offered by a business partner named "${partnerName || 'our agency'}". Be professional, specific, and client-focused. Do not use bullet points.`,
    });
    onChange({ ...serviceDescriptions, [service]: result });
    setGenerating(prev => ({ ...prev, [service]: false }));
  };

  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">Add services above to write descriptions for them.</p>;
  }

  return (
    <div className="space-y-2">
      {services.map(service => (
        <div key={service} className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium hover:bg-muted/40 transition-colors"
            onClick={() => toggleExpand(service)}
          >
            <span>{service}</span>
            <div className="flex items-center gap-2">
              {serviceDescriptions[service] && (
                <span className="text-xs text-primary font-normal">Has description</span>
              )}
              {expanded[service] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {expanded[service] && (
            <div className="px-4 pb-3 pt-1 bg-muted/20 space-y-2">
              <Textarea
                placeholder={`Describe what you offer for "${service}"...`}
                value={serviceDescriptions[service] || ''}
                onChange={e => handleDescChange(service, e.target.value)}
                className="h-24 resize-none text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={() => generateDesc(service)}
                disabled={generating[service]}
              >
                {generating[service]
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</>
                  : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate with AI</>
                }
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}