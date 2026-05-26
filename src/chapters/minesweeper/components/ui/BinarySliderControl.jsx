export default function BinarySliderControl({ id, label, value, onChange, accentClass = 'accent-sky-400' }) {
  const numericValue = value ? 1 : 0;

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400" htmlFor={id}>
          {label}
        </label>
        <span className={`text-xs font-semibold ${value ? 'text-sky-200' : 'text-slate-500'}`}>{value ? 'ON' : 'OFF'}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={1}
        value={numericValue}
        onChange={(event) => onChange(Number(event.target.value) === 1)}
        className={`mt-2 w-full ${accentClass}`}
      />
    </div>
  );
}
