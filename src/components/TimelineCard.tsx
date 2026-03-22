import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface TimelineCardProps {
  icon: string;
  title: string;
  subtitle: string;
  accentClass: string;
  glowClass: string;
  items: string[];
  isActive: boolean;
  strikethrough?: boolean;
  delay?: number;
  isLast?: boolean;
}

const TimelineCard = ({
  icon,
  title,
  subtitle,
  accentClass,
  glowClass,
  items,
  isActive,
  strikethrough = false,
  delay = 0,
  isLast = false,
}: TimelineCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-3">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center pt-1">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
            isActive ? `${glowClass} bg-secondary` : "bg-secondary/60"
          }`}
          style={{ animationDelay: `${delay}ms` }}
        >
          {icon}
        </div>
        {!isLast && <div className="timeline-connector flex-1 min-h-[24px]" />}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-3 glass rounded-xl overflow-hidden transition-all duration-500 ${
          isActive ? "animate-reveal-up" : "opacity-40"
        }`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3.5 text-left active:scale-[0.98] transition-transform"
        >
          <div>
            <h3 className={`text-sm font-semibold ${accentClass}`}>{title}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-3.5 pb-3.5 space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`text-xs leading-relaxed text-foreground/80 flex items-start gap-2 ${
                    strikethrough ? "line-through text-synapse-red/60 decoration-synapse-red/40" : ""
                  }`}
                >
                  <span className="text-muted-foreground/50 mt-px">•</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
