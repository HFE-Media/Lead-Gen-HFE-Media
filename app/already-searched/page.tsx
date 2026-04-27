import { StatusPill } from "@/components/status-pill";
import { getSearchTerms } from "@/lib/data";
import { getRegionLabel } from "@/lib/regions";
import { formatDate } from "@/lib/utils";

export default async function AlreadySearchedPage() {
  const terms = await getSearchTerms("searched");

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Already searched</p>
        <h1 className="mt-2 font-display text-3xl text-white">{terms.length} completed terms</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Term</th>
              <th>Region</th>
              <th>Status</th>
              <th>Results Seen</th>
              <th>Searched At</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term) => (
              <tr key={term.id}>
                <td className="font-medium">{term.term}</td>
                <td>{getRegionLabel(term.region)}</td>
                <td>
                  <StatusPill status={term.status} />
                </td>
                <td>{term.result_count}</td>
                <td>{formatDate(term.searched_at)}</td>
              </tr>
            ))}
            {terms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                  No search terms have been completed yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
