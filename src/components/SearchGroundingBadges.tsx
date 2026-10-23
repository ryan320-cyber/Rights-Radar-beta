import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

export interface GroundingSource {
  title: string;
  url: string;
}

interface SearchGroundingBadgesProps {
  sources: GroundingSource[];
  label?: string;
}

export function SearchGroundingBadges({ sources, label = 'Sources vérifiées (Google Search)' }: SearchGroundingBadgesProps) {
  if (!sources || sources.length === 0) return null;

  // Extract clean hostname for badge
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'web';
    }
  };

  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
      <div className="flex items-center gap-2 text-[11px] font-code text-white/60">
        <Globe className="w-3.5 h-3.5 text-[#43DDB0]" />
        <span>{label}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => {
          const domain = getDomain(source.url);
          return (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${source.title} (${source.url})`}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#43DDB0]/40 transition text-xs font-body text-white/80 hover:text-white"
            >
              <span className="font-code text-[10px] text-[#43DDB0] bg-[#43DDB0]/10 px-1 rounded">
                {domain}
              </span>
              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                {source.title}
              </span>
              <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-[#43DDB0] shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
