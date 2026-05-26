import { MINESWEEPER_CHAPTER_META } from './minesweeper/chapterConfig';

function PlaceholderChapter({ title }) {
  return (
    <main className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-700/70 bg-slate-950/70 p-8 shadow-glow backdrop-blur">
        <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500 mono">AQL Gym Chapter</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-50">{title}</h1>
        <p className="mt-3 text-slate-300">This chapter is planned and will be added in a future milestone.</p>
      </div>
    </main>
  );
}

const PLANNED_CHAPTERS = [
  {
    id: 'chapter-2',
    title: 'Chapter 2',
    route: '/chapters/chapter-2',
    status: 'planned',
    description: 'Coming soon.',
    component: () => <PlaceholderChapter title="Chapter 2" />,
    configSchema: null,
    defaultConfig: null,
    capabilities: { guide: false, fullscreen: false },
    training: { hasGuidePage: false },
  },
  {
    id: 'chapter-3',
    title: 'Chapter 3',
    route: '/chapters/chapter-3',
    status: 'planned',
    description: 'Coming soon.',
    component: () => <PlaceholderChapter title="Chapter 3" />,
    configSchema: null,
    defaultConfig: null,
    capabilities: { guide: false, fullscreen: false },
    training: { hasGuidePage: false },
  },
];

export const chapters = [MINESWEEPER_CHAPTER_META, ...PLANNED_CHAPTERS];

export function getChapterById(id) {
  return chapters.find((chapter) => chapter.id === id);
}
