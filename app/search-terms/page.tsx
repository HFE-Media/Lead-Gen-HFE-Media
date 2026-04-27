import { SearchTermsManager } from "@/components/search-terms-manager";
import { SearchTermsNav } from "@/components/search-terms-nav";
import { getSearchTerms } from "@/lib/data";

export default async function SearchTermsPage() {
  const terms = await getSearchTerms();

  return (
    <div className="space-y-6">
      <SearchTermsNav currentPath="/search-terms" />
      <SearchTermsManager terms={terms} />
    </div>
  );
}
