type StatCardProps = {
  label: string;
  value: string | number;
  footnote: string;
};

export function StatCard({ label, value, footnote }: StatCardProps) {
  return (
    <div className="panel bg-panel p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className="mt-4 font-display text-4xl text-white">{value}</p>
      <p className="mt-2 text-sm text-muted">{footnote}</p>
    </div>
  );
}
