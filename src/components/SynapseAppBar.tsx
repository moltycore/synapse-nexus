import { Menu, User } from "lucide-react";

const SynapseAppBar = () => {
  return (
    <header className="glass sticky top-0 z-50 px-5 pt-3 pb-3">
      <div className="flex items-center justify-between">
        <button className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/[0.06] active:scale-95">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="font-display text-gradient-purple">Synapse</span>
          </h1>
        </div>

        <button className="p-2 -mr-2 rounded-lg transition-colors hover:bg-white/[0.06] active:scale-95">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-synapse-purple to-synapse-blue flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default SynapseAppBar;
