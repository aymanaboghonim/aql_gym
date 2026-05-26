import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Board from './components/Board';
import SolverGuidePage from './components/SolverGuidePage';
import ThemeSelector from '../../components/ThemeSelector';
import BoardSetupPanel from './components/ui/BoardSetupPanel';
import BinarySliderControl from './components/ui/BinarySliderControl';
import MetricsPanel from './components/ui/MetricsPanel';
import ResultModal from './components/ui/ResultModal';
import {
  MODE_PROFILES,
  UI_FEATURES,
  applyModeProfile,
  getDefaultFeatureState,
  getMaxPlayableMines,
} from './config/gameConfig';
import { getNeighborIds } from './constants/board';
import { useMinesweeper } from './hooks/useMinesweeper';
import { saveSettings } from './persistence/settingsStorage';

function getAudioContext(audioContextRef) {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass();
  }

  if (audioContextRef.current.state === 'suspended') {
    audioContextRef.current.resume().catch(() => {});
  }

  return audioContextRef.current;
}

function playTone(audioContext, { frequency, duration = 0.08, type = 'sine', gain = 0.03, startTime = 0 }) {
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
  volume.gain.setValueAtTime(0.0001, audioContext.currentTime + startTime);
  volume.gain.exponentialRampToValueAtTime(gain, audioContext.currentTime + startTime + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + startTime + duration);

  oscillator.connect(volume);
  volume.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime + startTime);
  oscillator.stop(audioContext.currentTime + startTime + duration + 0.02);
}

function playSequence(audioContext, notes) {
  notes.forEach((note) => playTone(audioContext, note));
}

function formatStatus(status) {
  if (status === 'won') return 'Mission complete';
  if (status === 'lost') return 'Mine triggered';
  if (status === 'playing') return 'In progress';
  return 'Ready';
}

export default function MinesweeperChapter() {
  const {
    board,
    status,
    gameWon,
    gameLost,
    metrics,
    boardSize,
    mineCount,
    revealCell,
    flagCell,
    resetGame,
    setDifficultyPreset,
    safeCellIds,
    initialSettings,
  } = useMinesweeper();

  const [activePage, setActivePage] = useState('game');
  const [gridFullscreen, setGridFullscreen] = useState(false);
  const [fullscreenBoardViewport, setFullscreenBoardViewport] = useState({ width: 0, height: 0 });
  const [boardViewport, setBoardViewport] = useState({ width: 0, height: 0 });
  const [highlightAnchors, setHighlightAnchors] = useState(new Set());
  const [hoveredCellId, setHoveredCellId] = useState(null);
  const [selectedCellId, setSelectedCellId] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [modeProfile, setModeProfile] = useState(initialSettings.modeProfile || 'beginner');
  const [featureState, setFeatureState] = useState({
    ...getDefaultFeatureState(),
    ...(initialSettings.features || {}),
  });

  const {
    teacherMode,
    highlightMode,
    hintMode,
    soundEnabled,
    showFlagDiscovery,
    showRemainingFlags,
  } = featureState;

  const audioContextRef = useRef(null);
  const lastGameStateRef = useRef(status);
  const fullscreenBoardRef = useRef(null);
  const boardViewportRef = useRef(null);

  const highlightedIds = useMemo(() => {
    const ids = new Set();

    for (const anchorId of highlightAnchors) {
      ids.add(anchorId);
      for (const neighborId of getNeighborIds(anchorId, boardSize)) {
        ids.add(neighborId);
      }
    }

    return ids;
  }, [boardSize, highlightAnchors]);

  const safeCells = metrics.totalSafeCells;
  const maxMines = getMaxPlayableMines(boardSize);

  function setFeature(featureId, enabled) {
    setFeatureState((previous) => {
      const next = {
        ...previous,
        [featureId]: enabled,
      };
      saveSettings({
        boardSize,
        mineCount,
        modeProfile,
        features: next,
      });
      return next;
    });
  }

  function handleProfileChange(profileId) {
    setModeProfile(profileId);
    setFeatureState((previous) => {
      const next = applyModeProfile(profileId, previous);
      saveSettings({
        boardSize,
        mineCount,
        modeProfile: profileId,
        features: next,
      });
      return next;
    });
  }

  useEffect(() => {
    if (!highlightAnchors.size) {
      return;
    }

    const nextAnchors = new Set();

    for (const anchorId of highlightAnchors) {
      if (board.some((cell) => cell.id === anchorId)) {
        nextAnchors.add(anchorId);
      }
    }

    if (nextAnchors.size !== highlightAnchors.size) {
      setHighlightAnchors(nextAnchors);
    }
  }, [board, highlightAnchors]);

  useEffect(() => {
    function handleShortcut(event) {
      if (event.key === 'Escape' && gridFullscreen) {
        event.preventDefault();
        setGridFullscreen(false);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        setFeature('teacherMode', !teacherMode);
      }

      if (event.key.toLowerCase() === 'h' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        setFeature('highlightMode', !highlightMode);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [gridFullscreen, highlightMode, teacherMode, setFeature]);

  useEffect(() => {
    if (!gridFullscreen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [gridFullscreen]);

  useEffect(() => {
    if (!gridFullscreen || !fullscreenBoardRef.current) {
      return undefined;
    }

    const element = fullscreenBoardRef.current;

    function updateViewport() {
      const rect = element.getBoundingClientRect();
      setFullscreenBoardViewport({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    }

    updateViewport();

    const observer = new ResizeObserver(() => {
      updateViewport();
    });

    observer.observe(element);
    window.addEventListener('resize', updateViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateViewport);
    };
  }, [gridFullscreen]);

  useEffect(() => {
    if (!boardViewportRef.current) {
      return undefined;
    }

    const element = boardViewportRef.current;

    function updateViewport() {
      const rect = element.getBoundingClientRect();
      setBoardViewport({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    }

    updateViewport();

    const observer = new ResizeObserver(() => {
      updateViewport();
    });

    observer.observe(element);
    window.addEventListener('resize', updateViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateViewport);
    };
  }, [boardSize, showRemainingFlags]);

  useEffect(() => {
    if (!soundEnabled) {
      lastGameStateRef.current = status;
      return;
    }

    const previousStatus = lastGameStateRef.current;
    if (previousStatus !== status) {
      const audioContext = getAudioContext(audioContextRef);
      if (audioContext) {
        if (status === 'won') {
          playSequence(audioContext, [
            { frequency: 523.25, duration: 0.09, gain: 0.028, type: 'triangle' },
            { frequency: 659.25, duration: 0.09, gain: 0.028, type: 'triangle', startTime: 0.1 },
            { frequency: 783.99, duration: 0.14, gain: 0.03, type: 'triangle', startTime: 0.2 },
          ]);
        }

        if (status === 'lost') {
          playSequence(audioContext, [
            { frequency: 220, duration: 0.12, gain: 0.03, type: 'sawtooth' },
            { frequency: 164.81, duration: 0.16, gain: 0.03, type: 'sawtooth', startTime: 0.12 },
          ]);
        }
      }
    }

    lastGameStateRef.current = status;
  }, [soundEnabled, status]);

  useEffect(() => {
    if (status === 'won') {
      setResultModal('won');
      return;
    }

    if (status === 'lost') {
      setResultModal('lost');
      return;
    }

    setResultModal(null);
  }, [status]);

  function toggleHighlightAnchor(cellId) {
    setHighlightAnchors((previous) => {
      const next = new Set(previous);

      if (next.has(cellId)) {
        next.delete(cellId);
      } else {
        next.add(cellId);
      }

      return next;
    });
    setSelectedCellId(cellId);
  }

  function createClickHandler(cell) {
    return (event) => {
      event.preventDefault();

      if (event.shiftKey || highlightMode) {
        toggleHighlightAnchor(cell.id);
        return;
      }

      if (soundEnabled) {
        const audioContext = getAudioContext(audioContextRef);
        playTone(audioContext, {
          frequency: cell.isRevealed ? 440 : 560,
          duration: 0.06,
          gain: 0.022,
          type: 'sine',
        });
      }

      revealCell(cell.id);
      setSelectedCellId(cell.id);
    };
  }

  function createContextMenuHandler(cell) {
    return (event) => {
      event.preventDefault();

      if (soundEnabled) {
        const audioContext = getAudioContext(audioContextRef);
        playSequence(audioContext, [
          { frequency: 310, duration: 0.05, gain: 0.02, type: 'square' },
          { frequency: 415, duration: 0.08, gain: 0.02, type: 'square', startTime: 0.06 },
        ]);
      }

      flagCell(cell.id);
      setSelectedCellId(cell.id);
    };
  }

  function createHoverHandler(cell) {
    return () => {
      setHoveredCellId(cell.id);
    };
  }

  function applyDifficultySettings(size, mines) {
    setFeatureState((previous) => ({ ...previous, teacherMode: false, highlightMode: false }));
    setHighlightAnchors(new Set());
    setHoveredCellId(null);
    setSelectedCellId(null);
    const nextMineCount = Math.max(0, Math.min(getMaxPlayableMines(size), mines));
    setDifficultyPreset(size, nextMineCount);
  }

  function handleBoardSizeChange(size) {
    applyDifficultySettings(size, Math.min(mineCount, getMaxPlayableMines(size)));
  }

  function handleMineCountChange(nextMineCount) {
    applyDifficultySettings(boardSize, nextMineCount);
  }

  function handleResetBoard() {
    resetGame();
    setHighlightAnchors(new Set());
    setHoveredCellId(null);
    setSelectedCellId(null);
  }

  function openGuidePage() {
    setGridFullscreen(false);
    setActivePage('guide');
  }

  function returnToGamePage() {
    setActivePage('game');
  }

  if (activePage === 'guide') {
    return <SolverGuidePage onBack={returnToGamePage} />;
  }

  return (
    <main className="h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-1.5 py-1 lg:px-2 flex flex-col overflow-hidden">
      <div className="flex w-full max-w-none flex-col gap-1 h-full overflow-hidden">
        <nav className="rounded-lg border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-2 py-1 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="aql-hero-title truncate text-base font-black tracking-tight bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent sm:text-lg">
                Minesweeper
              </div>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold border transition ${
                status === 'won' ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' :
                status === 'lost' ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' :
                'border-sky-400/50 bg-sky-500/15 text-sky-200'
              }`}>
                {formatStatus(status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Link
                to="/"
                className="rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-100 transition"
              >
                ← Home
              </Link>
              <button
                type="button"
                onClick={() => setGridFullscreen(true)}
                className="rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-100 transition"
              >
                🖥️ Fullscreen
              </button>
              <button
                type="button"
                onClick={openGuidePage}
                className="rounded-lg border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 px-2 py-1 text-[11px] font-semibold text-sky-100 transition"
              >
                📖 Learn
              </button>
              <div className="hidden lg:block h-4 w-px bg-slate-700/50"></div>
              <ThemeSelector />
            </div>
          </div>
        </nav>

        <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-2 flex-shrink-0 xl:hidden">
          <MetricsPanel
            safeCells={safeCells}
            mineCount={mineCount}
            remainingMines={metrics.remainingMines}
            moves={metrics.moves}
            boardSize={boardSize}
            showRemainingFlags={showRemainingFlags}
          />
        </div>

        <div className="grid flex-1 min-h-0 gap-2 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
          <aside className="hidden xl:flex min-h-0 flex-col gap-2 overflow-auto rounded-lg border border-slate-700/50 bg-slate-900/60 p-3 backdrop-blur-sm lesson-scrollbar">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Modes</div>
              <div className="mt-1 text-xs text-slate-400">Capability-driven mode controls.</div>
            </div>

            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor="mode-profile">
                Profile
              </label>
              <select
                id="mode-profile"
                value={modeProfile}
                onChange={(event) => handleProfileChange(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
              >
                {Object.values(MODE_PROFILES).map((profile) => (
                  <option key={profile.id} value={profile.id}>{profile.label}</option>
                ))}
              </select>
            </div>

            {Object.values(UI_FEATURES).map((feature) => (
              <BinarySliderControl
                key={feature.id}
                id={`left-${feature.id}-slider`}
                label={feature.label}
                value={Boolean(featureState[feature.id])}
                onChange={(value) => setFeature(feature.id, value)}
                accentClass={feature.accentClass}
              />
            ))}
          </aside>

          <section className="rounded-lg border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-1 shadow-lg min-h-0 flex flex-col">
            <div ref={boardViewportRef} className="flex-1 min-h-0 overflow-hidden rounded-lg bg-slate-950/80 p-1 ring-1 ring-slate-700/30 flex items-start justify-center">
              <div className="min-w-fit">
                <Board
                  board={board}
                  boardSize={boardSize}
                  teacherMode={teacherMode}
                  highlightedIds={highlightedIds}
                  highlightAnchors={highlightAnchors}
                  hintMode={hintMode}
                  safeCellIds={safeCellIds}
                  showFlagDiscovery={showFlagDiscovery}
                  gameWon={gameWon}
                  gameLost={gameLost}
                  isFullscreen={false}
                  viewportWidth={boardViewport.width}
                  viewportHeight={boardViewport.height}
                  onCellClick={(cell) => createClickHandler(cell)}
                  onCellContextMenu={(cell) => createContextMenuHandler(cell)}
                  onCellHover={(cell) => createHoverHandler(cell)}
                />
              </div>
            </div>
          </section>

          <aside className="hidden xl:flex min-h-0 flex-col gap-2 overflow-auto rounded-lg border border-slate-700/50 bg-slate-900/60 p-3 backdrop-blur-sm lesson-scrollbar">
            <MetricsPanel
              safeCells={safeCells}
              mineCount={mineCount}
              remainingMines={metrics.remainingMines}
              moves={metrics.moves}
              boardSize={boardSize}
              showRemainingFlags={showRemainingFlags}
              compact
            />

            <BoardSetupPanel
              idPrefix="sidebar-difficulty"
              title="Board setup"
              subtitle="Adjust the board size and mine count directly."
              size={boardSize}
              mineCount={mineCount}
              maxMines={maxMines}
              onSizeChange={handleBoardSizeChange}
              onMineChange={handleMineCountChange}
            />

            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Quick actions</div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleResetBoard}
                  className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-left font-semibold text-slate-200 transition hover:border-slate-500"
                >
                  Reset board
                </button>
                <button
                  type="button"
                  onClick={openGuidePage}
                  className="rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-left font-semibold text-sky-100 transition hover:border-sky-300/60"
                >
                  Open guide
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {gridFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-2 md:p-3">
          <div className="mx-auto flex h-full w-full max-w-[2000px] flex-col gap-2">
            <div className="flex flex-col gap-3 rounded-lg border border-slate-700/50 bg-slate-900/70 backdrop-blur-sm px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  status === 'won' ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200' :
                  status === 'lost' ? 'border-rose-400/50 bg-rose-500/15 text-rose-200' :
                  'border-sky-400/50 bg-sky-500/15 text-sky-200'
                }`}>
                  {formatStatus(status)}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs font-semibold">Safe: {safeCells}</span>
                <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs font-semibold">Mines: {mineCount}</span>
                {showRemainingFlags && (
                  <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs font-semibold">
                    Flags: {metrics.remainingMines}
                  </span>
                )}
                <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs font-semibold">Moves: {metrics.moves}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                <button
                  type="button"
                  onClick={handleResetBoard}
                  title="Reset the board while staying in fullscreen"
                  aria-label="Reset board in fullscreen"
                  className="rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setGridFullscreen(false)}
                  title="Exit fullscreen view"
                  aria-label="Exit fullscreen view"
                  className="rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition"
                >
                  Exit
                </button>
              </div>
            </div>

            <div
              ref={fullscreenBoardRef}
              className="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-950/80 p-2 ring-1 ring-slate-700/30"
            >
              <Board
                board={board}
                boardSize={boardSize}
                teacherMode={teacherMode}
                highlightedIds={highlightedIds}
                highlightAnchors={highlightAnchors}
                hintMode={hintMode}
                safeCellIds={safeCellIds}
                showFlagDiscovery={showFlagDiscovery}
                gameWon={gameWon}
                gameLost={gameLost}
                isFullscreen
                viewportWidth={fullscreenBoardViewport.width}
                viewportHeight={fullscreenBoardViewport.height}
                onCellClick={(cell) => createClickHandler(cell)}
                onCellContextMenu={(cell) => createContextMenuHandler(cell)}
                onCellHover={(cell) => createHoverHandler(cell)}
              />
            </div>
          </div>
        </div>
      )}

      <ResultModal
        resultModal={resultModal}
        onRestart={() => {
          setResultModal(null);
          handleResetBoard();
        }}
        onClose={() => setResultModal(null)}
      />
    </main>
  );
}
