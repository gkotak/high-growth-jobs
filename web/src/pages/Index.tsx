import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import CompanySheet from "@/components/CompanySheet";
import { useJobs } from "@/hooks/useJobs";
import { useDebounce } from "@/hooks/useDebounce";
import HeroSection from "@/widgets/landing/HeroSection";
import FilterSection from "@/widgets/landing/FilterSection";
import ControlBar from "@/widgets/landing/ControlBar";
import JobListSection from "@/widgets/landing/JobListSection";
import { FilterState } from "@/widgets/landing/types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [page, setPage] = useState(1);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const {
    data,
    isLoading
  } = useJobs(debouncedSearch, filters, page);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const allJobs = data?.data ?? [];
  const totalCount = data?.meta.total_count ?? 0;
  const totalPages = Math.ceil(totalCount / 50);

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

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationEllipsis key="e1" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<PaginationEllipsis key="e2" />);
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

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

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center pb-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
