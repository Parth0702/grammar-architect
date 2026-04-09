export default function Header({ tabs, activeTab, onTabChange, hasGrammar }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-6 py-3.5 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
          <h1 className="text-xl font-bold text-primary drop-shadow-[0_0_8px_rgba(195,255,156,0.4)] tracking-tight font-headline">
            Grammar Architect
          </h1>
        </div>

        <nav className="hidden md:flex gap-1 items-center bg-surface-container-low/50 rounded-full px-2 py-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              disabled={tab.id !== 'garden' && !hasGrammar}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary'
                  : tab.id !== 'garden' && !hasGrammar
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-primary hover:bg-surface-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-lg"
                style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
