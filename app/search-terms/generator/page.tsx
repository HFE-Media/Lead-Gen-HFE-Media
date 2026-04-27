import { SearchTermGenerator } from "@/components/search-term-generator";
import { SearchTermsNav } from "@/components/search-terms-nav";
import { getGeneratorDataset } from "@/lib/data";

export default async function SearchTermsGeneratorPage() {
  const dataset = await getGeneratorDataset();

  return (
    <div className="space-y-6">
      <SearchTermsNav currentPath="/search-terms/generator" />
      <SearchTermGenerator dataset={dataset} />
    </div>
  );
}
