import { useState, useMemo } from "react";
import Header from "@/components/Header";
import CompanySheet from "@/components/CompanySheet";
import { useJobs } from "@/hooks/useJobs";
import HeroSection from "@/widgets/landing/HeroSection";
import FilterSection from "@/widgets/landing/FilterSection";
import JobListSection from "@/widgets/landing/JobListSection";
import { FilterState } from "@/widgets/landing/types";

const TOP_TIER_VCS = [
  "Sequoia Capital", "a16z", "Benchmark", "Founders Fund", "Accel",
  "Greylock", "Kleiner Perkins", "Index Ventures", "General Catalyst",
  "Tiger Global", "Thrive Capital", "Coatue Management",
];

const FUNDING_STAGE_MAP: Record<string, string[]> = {
  "Seed": ["Seed"],
  "Series A": ["Series A"],
  "Series B": ["Series B"],
  "Series C": ["Series C"],
  "Series D": ["Series D"],
  "Series E+": ["Series E", "Series F", "Series G", "Series H", "Series I"],
};

const Index = () => {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    roleType: [],
    experienceLevel: [],
    remote: [],
    fundingStage: [],
    investorTier: false,
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useJobs();

  const activeFilterCount = useMemo(() => {
    return (
      filters.roleType.length +
      filters.experienceLevel.length +
      filters.remote.length +
      filters.fundingStage.length +
      (filters.investorTier ? 1 : 0)
    );
  }, [filters]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          job.title.toLowerCase().includes(q) ||
          job.company.name.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Role type
      if (filters.roleType.length > 0 && !filters.roleType.includes(job.roleType))
        return false;

      // Experience
      if (
        filters.experienceLevel.length > 0 &&
        !filters.experienceLevel.includes(job.experienceLevel)
      )
        return false;

      // Remote
      if (filters.remote.length > 0 && !filters.remote.includes(job.remote))
        return false;

      // Funding stage
      if (filters.fundingStage.length > 0) {
        const allowedStages = filters.fundingStage.flatMap(
          (s) => FUNDING_STAGE_MAP[s] || []
        );
        if (!allowedStages.includes(job.company.fundingStage)) return false;
      }

      // Investor tier
      if (filters.investorTier) {
        const hasTopVC = job.company.investors.some((inv) =>
          TOP_TIER_VCS.includes(inv)
        );
        if (!hasTopVC) return false;
      }

      return true;
    });
  }, [search, filters, jobs]);

  const selectedCompany = selectedCompanyId
    ? jobs.find((j) => j.company.id === selectedCompanyId)?.company ?? null
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HeroSection search={search} onSearchChange={setSearch} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSection
            filters={filters}
            onFilterChange={setFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            jobCount={filteredJobs.length}
            activeFilterCount={activeFilterCount}
          />

          <main className="min-w-0 flex-1">
            <JobListSection
              jobs={filteredJobs}
              isLoading={isLoading}
              onCompanyClick={setSelectedCompanyId}
            />
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
