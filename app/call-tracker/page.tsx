import { LeadsTable } from "@/components/leads-table";
import { getLeads } from "@/lib/data";

export default async function CallTrackerPage() {
  const leads = await getLeads();
  return <LeadsTable leads={leads} mode="tracker" />;
}
