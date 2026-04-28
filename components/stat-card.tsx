type StatCardProps = {
  label: string;
  value: string | number;
  footnote: string;
};

export function StatCard({ label, value, footnote }: StatCardProps) {
  return (
    <div className="panel bg-panel p-5 lg:p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl text-white lg:text-[2.2rem]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{footnote}</p>
    </div>
  );
}
