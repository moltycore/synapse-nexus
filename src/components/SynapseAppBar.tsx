console.log("YENI APPBAR GELDI");
const CustomHamburger = () => {
  return (
    <div className="w-5 h-5 flex flex-col justify-center gap-[3px]">
      <span className="w-3 h-[2px] bg-muted-foreground rounded"></span>
      <span className="w-5 h-[2px] bg-muted-foreground rounded"></span>
      <span className="w-4 h-[2px] bg-muted-foreground rounded"></span>
    </div>
  );
};

const KebabMenu = () => {
  return (
    <div className="w-5 h-5 flex flex-col items-center justify-center gap-[2px]">
      <span className="w-[3px] h-[3px] bg-muted-foreground rounded-full"></span>
      <span className="w-[3px] h-[3px] bg-muted-foreground rounded-full"></span>
      <span className="w-[3px] h-[3px] bg-muted-foreground rounded-full"></span>
    </div>
  );
};

const SynapseAppBar = () => {
  return (
    <header className="glass sticky top-0 z-50 px-5 pt-3 pb-3">
      <div className="flex items-center justify-between">
        
        {/* Sol: Custom Hamburger */}
        <button className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/[0.06] active:scale-95">
          <CustomHamburger />
        </button>

        {/* Orta: Logo */}
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="font-display text-gradient-purple">Synapse</span>
          </h1>
        </div>

        {/* Sağ: Kebab Menu */}
        <button className="p-2 -mr-2 rounded-lg transition-colors hover:bg-white/[0.06] active:scale-95">
          <KebabMenu />
        </button>

      </div>
    </header>
  );
};

export default SynapseAppBar;
