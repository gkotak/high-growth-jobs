import { useState, useMemo } from "react";
import Header from "@/components/Header";
import CompanySheet from "@/components/CompanySheet";
import { useJobs } from "@/hooks/useJobs";
import { useDebounce } from "@/hooks/useDebounce";
import HeroSection from "@/widgets/landing/HeroSection";
import FilterSection from "@/widgets/landing/FilterSection";
import ControlBar from "@/widgets/landing/ControlBar";
import JobListSection from "@/widgets/landing/JobListSection";
import { FilterState } from "@/widgets/landing/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    roleType: [],
    experienceLevel: [],
    remote: [],
    fundingStage: [],
    investorTier: false,
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useJobs(debouncedSearch, filters);

  const allJobs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.meta.total_count ?? 0;

  const activeFilterCount = useMemo(() => {
    return (
      filters.roleType.length +
      filters.experienceLevel.length +
      filters.remote.length +
      filters.fundingStage.length +
      (filters.investorTier ? 1 : 0)
    );
  }, [filters]);

  const selectedCompany = selectedCompanyId
    ? allJobs.find((j) => j.company.id === selectedCompanyId)?.company ?? null
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HeroSection search={search} onSearchChange={setSearch} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilterSection
            filters={filters}
            onFilterChange={setFilters}
            showFilters={showFilters}
          />

          <main className="min-w-0 flex-1">
            <ControlBar
              filters={filters}
              onFilterChange={setFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              jobCount={totalCount}
              activeFilterCount={activeFilterCount}
            />

            <JobListSection
              jobs={allJobs}
              isLoading={isLoading}
              onCompanyClick={setSelectedCompanyId}
            />

            {hasNextPage && (
              <div className="mt-8 flex justify-center pb-10">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full sm:w-auto h-12 px-8 font-medium border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load more roles"
                  )}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <CompanySheet
        company={selectedCompany}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
};

export default Index;
