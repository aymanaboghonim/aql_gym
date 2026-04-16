import { Link } from 'react-router-dom';
import { chapters } from '../chapters/index.jsx';
import ThemeSelector from '../components/ThemeSelector';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 lg:px-8 relative">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2); }
          50% { text-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-fade-scale {
          animation: fade-in-scale 0.5s ease-out;
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        {/* Theme Selector - Top Right */}
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
          <ThemeSelector />
        </div>

        {/* Hero Section */}
        <header className="animate-slide-up space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="animate-pulse-glow text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent">
              AQL Gym
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Community Logic Playground
          </h2>
          <p className="mx-auto max-w-2xl text-slate-300 text-lg leading-relaxed">
            Interactive chapter-based learning platform for algorithms, logic, and problem-solving. Master one concept at a time.
          </p>
        </header>

        {/* Chapters Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.id}
              className="animate-fade-scale group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-sky-400/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-sky-500/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/0 to-sky-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-sky-400 font-semibold">Chapter {index + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    chapter.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                  }`}>
                    {chapter.status === 'active' ? 'Active' : 'Planned'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-50 group-hover:text-sky-300 transition-colors">
                  {chapter.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {chapter.description}
                </p>

                <div className="pt-2">
                  {chapter.status === 'active' ? (
                    <Link
                      to={chapter.route}
                      className="inline-flex items-center rounded-lg border border-sky-400/60 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 transition-all duration-300 hover:border-sky-300 hover:bg-sky-500/25 hover:shadow-md hover:shadow-sky-500/20 active:scale-95"
                    >
                      Open chapter →
                    </Link>
                  ) : (
                    <span className="inline-flex items-center rounded-lg border border-slate-600/60 bg-slate-700/20 px-4 py-2 text-sm font-semibold text-slate-400">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Footer hint */}
        <div className="text-center pt-6 border-t border-slate-800/50">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">More chapters coming soon</p>
        </div>
      </div>
    </main>
  );
}
