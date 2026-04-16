import { THEMES, useTheme } from '../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold px-2">Theme</div>
      </div>
      <div className="flex gap-1 rounded-lg border border-slate-700/50 bg-slate-800/50 p-1">
        {Object.values(THEMES).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggleTheme(t.id)}
            title={t.label}
            className={`rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${ 
              theme === t.id 
                ? 'border border-sky-400/60 bg-sky-500/20 text-sky-100' 
                : 'border border-transparent text-slate-400 hover:text-slate-200' 
            }`}
          >
            <span className="text-base">{t.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
