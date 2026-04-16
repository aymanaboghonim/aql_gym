import { useEffect, useMemo, useState } from 'react';
import ThemeSelector from '../../../components/ThemeSelector';

function RuleCard({ title, formula, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">{title}</div>
      <div className="mt-2 rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 mono">{formula}</div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function CellBox({ type, label }) {
  const classes = {
    number: 'border-slate-400 bg-slate-100 text-slate-900',
    hidden: 'border-slate-600 bg-slate-800 text-slate-200',
    mine: 'border-rose-400 bg-rose-500/20 text-rose-100',
    safe: 'border-emerald-400 bg-emerald-500/20 text-emerald-100',
  };

  return (
    <div
      className={`cell-box flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold ${classes[type] ?? classes.hidden}`}
      aria-label={label}
    >
      {label}
    </div>
  );
}

function PatternCard({ title, subtitle, rows, takeaway, defaultRevealed = false }) {
  const [showTakeaway, setShowTakeaway] = useState(defaultRevealed);

  function getDisplayCell(cell) {
    if (!showTakeaway && (cell.type === 'mine' || cell.type === 'safe')) {
      return { type: 'hidden', label: '?' };
    }

    return cell;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_10px_35px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">{subtitle}</div>
          <h3 className="mt-1 text-lg font-bold text-slate-50">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowTakeaway((value) => !value)}
          className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-400/40 hover:text-sky-100"
        >
          {showTakeaway ? 'Hide answer' : 'Show answer'}
        </button>
      </div>

      <div className="mt-3 inline-flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
        {rows.map((row, rowIndex) => (
          <div className="flex gap-1" key={`${title}-row-${rowIndex}`}>
            {row.map((cell, cellIndex) => {
              const displayCell = getDisplayCell(cell);

              return (
                <div
                  className="animate-cell-pop"
                  key={`${title}-cell-${rowIndex}-${cellIndex}`}
                  style={{ animationDelay: `${(rowIndex * row.length + cellIndex) * 35}ms` }}
                >
                  <CellBox type={displayCell.type} label={displayCell.label} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showTakeaway ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">{takeaway}</p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">Try it first. Reveal when you are ready.</p>
      )}
    </div>
  );
}

function LessonPanel({ eyebrow, title, copy, children }) {
  return (
    <div className="lesson-panel rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.28)] lg:p-5">
      <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500 mono">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold text-slate-50 sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{copy}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function NeighborVisualRule() {
  const board = [
    ['?', '?', '?'],
    ['M', '2', '?'],
    ['?', 'M', '?'],
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">Visual first</div>
      <h3 className="mt-2 text-base font-bold text-slate-100">Mine-neighbor rule in one glance</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">The clue counts mines in the 8 touching cells. Here, the center clue 2 is satisfied by two adjacent mines.</p>

      <div className="mt-3 inline-flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
        {board.map((row, rowIndex) => (
          <div className="flex gap-1" key={`neighbor-visual-row-${rowIndex}`}>
            {row.map((label, cellIndex) => {
              const type = label === 'M' ? 'mine' : label === '2' ? 'number' : 'hidden';
              return <CellBox key={`neighbor-visual-cell-${rowIndex}-${cellIndex}`} type={type} label={label} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageButton({ active, onClick, label, index }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left transition ${
        active ? 'border-sky-400/50 bg-sky-500/15 text-sky-100' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">
        <span>Step {index + 1}</span>
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-sky-300' : 'bg-slate-600'}`} />
      </div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
    </button>
  );
}

export default function SolverGuidePage({ onBack }) {
  const pattern121 = [
    [
      { type: 'number', label: '1' },
      { type: 'number', label: '2' },
      { type: 'number', label: '1' },
    ],
    [
      { type: 'mine', label: 'M' },
      { type: 'safe', label: 'S' },
      { type: 'mine', label: 'M' },
    ],
  ];

  const pattern1221 = [
    [
      { type: 'number', label: '1' },
      { type: 'number', label: '2' },
      { type: 'number', label: '2' },
      { type: 'number', label: '1' },
    ],
    [
      { type: 'mine', label: 'M' },
      { type: 'safe', label: 'S' },
      { type: 'safe', label: 'S' },
      { type: 'mine', label: 'M' },
    ],
  ];

  const subsetPattern = [
    [
      { type: 'number', label: '1' },
      { type: 'number', label: '1' },
    ],
    [
      { type: 'hidden', label: '?' },
      { type: 'hidden', label: '?' },
    ],
    [
      { type: 'safe', label: 'S' },
      { type: 'mine', label: 'M' },
    ],
  ];

  const lessonStages = [
    {
      key: 'strategy',
      label: 'Game plan',
      eyebrow: '01 strategy',
      title: 'Start with a simple game plan',
      copy:
        'Do not jump straight to hard logic. Clear guaranteed moves first, then scan patterns, then move to deeper reasoning only if needed.',
      body: (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">The ladder</div>
            <ol className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
              <li>1. Open certain mines and certain safe cells.</li>
              <li>2. Apply local templates like 1-2-1 and 1-2-2-1.</li>
              <li>3. Use subset reasoning for overlapping clues.</li>
              <li>4. Only guess when no deterministic move remains.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">Why it works</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Minesweeper is a constraint problem. If a move can be derived from the current board state, it should be shown before
              any example that needs inference or risk.
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'theory',
      label: 'Quick Rules',
      eyebrow: '02 theory',
      title: 'The only three rules you need',
      copy:
        'Keep this practical: each number is just a mine counter around it. Once the counter is satisfied, the rest are safe.',
      body: (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <NeighborVisualRule />
          </div>
          <RuleCard
            title="Constraint equation"
            formula="clue number = adjacent mines"
            description="Every revealed clue is an exact equation over neighboring hidden cells."
          />
          <RuleCard
            title="Certain mine rule"
            formula="hidden neighbors = clue number -> all hidden are mines"
            description="If a clue touches exactly the same number of hidden cells, each of them must be a mine."
          />
          <RuleCard
            title="Certain safe rule"
            formula="flagged neighbors = clue number -> remaining hidden are safe"
            description="If the mine count is already satisfied, the remaining hidden neighbors are safe."
          />
        </div>
      ),
    },
    {
      key: 'pattern',
      label: 'Pattern radar',
      eyebrow: '03 pattern',
      title: 'Spot shapes fast',
      copy:
        'Patterns are repeated board shapes. Call the shape, point to forced cells, and move on quickly.',
      body: (
        <div className="grid gap-4 md:grid-cols-2">
          <PatternCard
            title="1-2-1 Frontier"
            subtitle="Classic edge pattern"
            rows={pattern121}
            takeaway="The side cells are mines and the middle cell is safe."
            defaultRevealed={false}
          />
          <PatternCard
            title="1-2-2-1 Frontier"
            subtitle="Common extension"
            rows={pattern1221}
            takeaway="The outer cells are mines and the two middle cells are safe."
            defaultRevealed={false}
          />
          <div className="md:col-span-2">
            <PatternCard
              title="Shared-Neighbor Reasoning"
              subtitle="Subset subtraction"
              rows={subsetPattern}
              takeaway="If one clue's candidate set is a subset of another, subtract the overlap and the remainder becomes forced."
              defaultRevealed={false}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'example-1',
      label: 'Example run 1',
      eyebrow: '04 example',
      title: 'Quick demo: 1-2-1 in action',
      copy:
        'Run this like a coach: point to clue row, point to hidden row, call the result in one sentence.',
      body: (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <PatternCard
            title="Diagram"
            subtitle="1-2-1 with one hidden row"
            rows={pattern121}
            takeaway="The outer cells are mines. The center cell is safe."
            defaultRevealed={false}
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">How to narrate it</div>
            <ol className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
              <li>1. Read the clues from left to right.</li>
              <li>2. Mark the unique middle cell as safe.</li>
              <li>3. Mark the two edge cells as mines.</li>
              <li>4. Show how the numbers now satisfy the constraint exactly.</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      key: 'example-2',
      label: 'Example run 2',
      eyebrow: '05 example',
      title: 'Level up: wider pattern, same method',
      copy:
        'Same language, bigger shape. This keeps learners confident while you increase board complexity.',
      body: (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <PatternCard
            title="Diagram"
            subtitle="1-2-2-1 with a wider frontier"
            rows={pattern1221}
            takeaway="The outer cells are mines and the two middle cells are safe."
            defaultRevealed={false}
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">Teaching note</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Use the same sequence again: identify the clue band, isolate the hidden boundary, and point to the forced cells one by
              one. The audience should see the pattern, not just hear the result.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpeedMs, setAutoPlaySpeedMs] = useState(2800);

  const activeStage = lessonStages[activeStageIndex];
  const progressPercent = ((activeStageIndex + 1) / lessonStages.length) * 100;

  const stageTip = useMemo(() => {
    if (activeStageIndex < 2) {
      return 'Foundation stage: establish method before examples.';
    }

    if (activeStageIndex < lessonStages.length - 1) {
      return 'Application stage: pattern recognition and guided walkthrough.';
    }

    return 'Finish stage: recap and transition back to gameplay.';
  }, [activeStageIndex, lessonStages.length]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveStageIndex((value) => Math.min(value + 1, lessonStages.length - 1));
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveStageIndex((value) => Math.max(value - 1, 0));
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lessonStages.length]);

  useEffect(() => {
    if (!autoPlay) {
      return undefined;
    }

    if (activeStageIndex === lessonStages.length - 1) {
      setAutoPlay(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveStageIndex((value) => Math.min(value + 1, lessonStages.length - 1));
    }, autoPlaySpeedMs);

    return () => window.clearTimeout(timer);
  }, [activeStageIndex, autoPlay, autoPlaySpeedMs, lessonStages.length]);

  function goToNextStage() {
    setActiveStageIndex((value) => Math.min(value + 1, lessonStages.length - 1));
  }

  function goToPreviousStage() {
    setActiveStageIndex((value) => Math.max(value - 1, 0));
  }

  return (
    <main className="guide-atmosphere h-screen overflow-hidden px-3 py-3 lg:px-4 lg:py-4">
      <div className="mx-auto flex h-full w-full max-w-[1900px] flex-col gap-3">
        <header className="panel-shell flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between flex-shrink-0">
          <div>
            <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500 mono">AQL Gym Guide</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Solve Faster, Teach Smarter
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
              This is coach mode: one move idea at a time, one pattern at a time, one demo at a time. Keep it fast, visual, and clear.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
              <span className="coach-pulse h-2 w-2 rounded-full bg-emerald-300" />
              Use Arrow Left/Right to move quickly between stages
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoPlay((value) => !value)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                autoPlay
                  ? 'border-amber-300/60 bg-amber-500/15 text-amber-100'
                  : 'border-slate-700 bg-slate-900/85 text-slate-100 hover:border-slate-400 hover:bg-slate-800'
              }`}
            >
              {autoPlay ? 'Pause autoplay' : 'Play walkthrough'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border border-slate-700 bg-slate-900/85 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800"
            >
              Back to AQL Gym
            </button>

            <div className="hidden lg:block h-6 w-px bg-slate-700/50"></div>
            <ThemeSelector />
          </div>
        </header>

        <section className="grid flex-1 min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_480px]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-3 flex-shrink-0">
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="lesson-scrollbar flex gap-3 overflow-x-auto pb-1">
              {lessonStages.map((stage, index) => (
                <StageButton
                  key={stage.key}
                  active={index === activeStageIndex}
                  onClick={() => setActiveStageIndex(index)}
                  label={stage.label}
                  index={index}
                />
              ))}
              </div>
            </div>

            <div key={activeStage.key} className="animate-lesson-in flex-1 min-h-0 overflow-auto pr-1 lesson-scrollbar">
              <LessonPanel eyebrow={activeStage.eyebrow} title={activeStage.title} copy={activeStage.copy}>
                {activeStage.body}
              </LessonPanel>
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950/60 p-3 flex-shrink-0">
              <div>
                <div className="text-sm text-slate-300">
                  Stage {activeStageIndex + 1} of {lessonStages.length}
                </div>
                <div className="text-xs text-slate-500">{stageTip}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goToPreviousStage}
                  disabled={activeStageIndex === 0}
                  className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNextStage}
                  disabled={activeStageIndex === lessonStages.length - 1}
                  className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next step
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStageIndex(0)}
                  className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                >
                  Restart
                </button>
              </div>
            </div>
          </div>

          <aside className="panel-shell flex min-h-0 flex-col gap-3 overflow-auto lesson-scrollbar p-4 lg:p-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500 mono">Progress</div>
              <h3 className="mt-2 text-xl font-bold text-slate-50">Live coach flow</h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mono">Controller</div>

              <label className="mt-3 block text-xs font-semibold text-slate-300" htmlFor="stage-slider">
                Stage slider: {activeStageIndex + 1}/{lessonStages.length}
              </label>
              <input
                id="stage-slider"
                type="range"
                min={1}
                max={lessonStages.length}
                value={activeStageIndex + 1}
                onChange={(event) => setActiveStageIndex(Number(event.target.value) - 1)}
                className="mt-2 w-full accent-sky-400"
              />

              <label className="mt-4 block text-xs font-semibold text-slate-300" htmlFor="speed-slider">
                Autoplay speed: {(autoPlaySpeedMs / 1000).toFixed(1)}s
              </label>
              <input
                id="speed-slider"
                type="range"
                min={1600}
                max={5200}
                step={200}
                value={autoPlaySpeedMs}
                onChange={(event) => setAutoPlaySpeedMs(Number(event.target.value))}
                className="mt-2 w-full accent-amber-400"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
              Talk like this: game plan, quick rule, pattern callout, then short demo. Learners stay engaged because each stage has one
              clear job.
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs leading-6 text-slate-400">
              <div className="mb-1 font-semibold text-slate-300">Visual Legend</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Revealed clue
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> Hidden
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-rose-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /> Forced mine
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /> Forced safe
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs leading-6 text-slate-400">
              <div className="mb-1 font-semibold text-slate-300">Sources</div>
              <a className="text-sky-300 hover:text-sky-200" href="https://en.wikipedia.org/wiki/Minesweeper_(video_game)" target="_blank" rel="noreferrer">
                Wikipedia: gameplay, rules, and complexity overview
              </a>
              <br />
              <a className="text-sky-300 hover:text-sky-200" href="https://magnushoff.com/articles/minesweeper/" target="_blank" rel="noreferrer">
                Magnus Hovland Hoff: local rules vs global constraint search
              </a>
              <br />
              <a className="text-sky-300 hover:text-sky-200" href="https://www.cs.toronto.edu/~cvs/minesweeper/" target="_blank" rel="noreferrer">
                University of Toronto CSP project: formulation and strategy
              </a>
              <br />
              <a className="text-sky-300 hover:text-sky-200" href="https://www.isnphard.com/i/minesweeper/" target="_blank" rel="noreferrer">
                IsNPHard: complexity classification notes
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
