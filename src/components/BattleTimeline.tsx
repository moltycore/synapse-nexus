import TimelineCard from "./TimelineCard";

interface BattleTimelineProps {
  isActive: boolean;
  phase: number; // 0=idle, 1=researcher, 2=reviewer, 3=visionary
}

const BattleTimeline = ({ isActive, phase }: BattleTimelineProps) => {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/60 font-medium">
          Cross-Examination Flow
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div className="pl-1">
        <TimelineCard
          icon="🔍"
          title=""
          subtitle=""
          accentClass="text-synapse-blue"
          glowClass="glow-blue"
          items={[
            "Market data shows 34% YoY growth in the target segment with accelerating momentum.",
            "Three competing solutions exist but none address the integration gap identified.",
            "User research (n=847) indicates strong willingness-to-pay at the $29/mo tier.",
          ]}
          isActive={isActive && phase >= 1}
          delay={0}
        />

        <TimelineCard
          icon="⚖️"
          title=""
          subtitle=""
          accentClass="text-synapse-red"
          glowClass="glow-red"
          items={[
            "34% growth figure cherry-picks favorable quarters — trailing 12mo average is 19%.",
            "Two of three 'competitors' have pivot announcements pending — landscape unstable.",
            "WTP study used anchoring bias in pricing methodology — real figure likely 15-22% lower.",
          ]}
          isActive={isActive && phase >= 2}
          strikethrough
          delay={150}
        />

        <TimelineCard
          icon="💡"
          title=""
          subtitle=""
          accentClass="text-synapse-gold"
          glowClass="glow-gold"
          items={[
            "Ignore the segment entirely — build the integration layer as an open protocol.",
            "Monetize through ecosystem licensing, not direct subscription — 10x TAM expansion.",
            "First-mover on protocol approach locks in network effects before competitors pivot.",
          ]}
          isActive={isActive && phase >= 3}
          delay={300}
          isLast
        />
      </div>
    </div>
  );
};

export default BattleTimeline;
