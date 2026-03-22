interface DecisionCardProps {
  decision: string | null;
  isActive: boolean;
}

const DecisionCard = ({ decision, isActive }: DecisionCardProps) => {
  return (
    <div className="px-4 pt-6 pb-4">
      <div
        className={`glass-strong rounded-2xl p-6 transition-all duration-700 ${
          isActive ? "glow-purple-active animate-float-glow" : "glow-purple"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            isActive ? "bg-synapse-purple animate-pulse" : "bg-muted-foreground/30"
          }`} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
            Synapse Final Decision
          </span>
        </div>

        {decision ? (
          <p className="font-display text-xl leading-snug text-foreground animate-reveal-up">
            {decision}
          </p>
        ) : (
          <div className="space-y-2.5">
            <div className="h-5 bg-white/[0.04] rounded-md w-4/5" />
            <div className="h-5 bg-white/[0.03] rounded-md w-3/5" />
            <p className="text-xs text-muted-foreground/50 mt-3 italic">
              Awaiting synthesis…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionCard;
