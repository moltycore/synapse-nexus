const CustomHamburger = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
    {/* Üst kısa çizgi */}
    <rect x="0" y="0" width="10" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    {/* Üst çizgi yanındaki nokta */}
    <circle cx="17" cy="1" r="1.5" fill="#EDEFF3" fillOpacity="0.9" />
    {/* Orta çizgi */}
    <rect x="0" y="9" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    {/* Alt çizgi */}
    <rect x="0" y="18" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
  </svg>
);

const KebabMenu = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="2" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="8" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="14" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
  </svg>
);

const SynapseAppBar = () => {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4"
      style={{
        height: "60px",
        backgroundColor: "#0F1115",
        borderBottom: "1px solid rgba(28, 31, 38, 0.6)",
      }}
    >
      {/* Sol: Custom hamburger */}
      <button
        className="flex items-center justify-center"
        style={{
          minWidth: "40px",
          minHeight: "40px",
          transition: "opacity 120ms ease, transform 120ms ease",
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
          e.currentTarget.style.opacity = "0.7";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.opacity = "1";
        }}
      >
        <CustomHamburger />
      </button>

      {/* Orta: Title */}
      <div className="flex flex-col items-center" style={{ gap: "2px" }}>
        <span
          style={{
            fontFamily: "Inter, SF Pro, sans-serif",
            fontWeight: 600,
            fontSize: "19px",
            color: "#EDEFF3",
            letterSpacing: "-0.2px",
          }}
        >
          Synapse
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "#9CA3AF",
            fontWeight: 400,
            letterSpacing: "0.5px",
          }}
        >
          Nexus v1.0
        </span>
      </div>

      {/* Sağ: Kebab menu */}
      <button
        className="flex items-center justify-center"
        style={{
          minWidth: "40px",
          minHeight: "40px",
          transition: "opacity 120ms ease, transform 120ms ease",
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
          e.currentTarget.style.opacity = "0.7";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.opacity = "1";
        }}
      >
        <KebabMenu />
      </button>
    </header>
  );
};

export default SynapseAppBar;
