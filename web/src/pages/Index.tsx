import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import rocketDots from "@/assets/rocket-dots.png";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import JobCard from "@/components/JobCard";
import CompanySheet from "@/components/CompanySheet";
import { useJobs } from "@/hooks/useJobs";

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
  const [filters, setFilters] = useState({
    roleType: [] as string[],
    experienceLevel: [] as string[],
    remote: [] as string[],
    fundingStage: [] as string[],
    investorTier: false,
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useJobs();

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
  }, [search, filters]);

  const selectedCompany = selectedCompanyId
    ? jobs.find((j) => j.company.id === selectedCompanyId)?.company ?? null
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-foreground/[0.03]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`, backgroundSize: '128px 128px' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Radial glow */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        {/* Dotted rocket illustration - right side */}
        <div className="absolute right-8 top-1/2 -translate-y-[42%] hidden lg:flex items-center justify-center">
          <img src={rocketDots} alt="" className="h-[28rem] w-[26rem] object-contain opacity-[0.12]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Find your next role at a{" "}
            <span className="text-primary">high-growth startup</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Signal-driven job discovery. Filter by funding stage, investor quality,
            and growth signals to find the best opportunities.
          </p>
          <div className="mt-5 max-w-xl">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          {showFilters ? "Hide Filters" : "Filters"}
        </button>

        <div className="flex gap-6">
          {/* Sidebar */}
          {showFilters && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-20">
                <FilterSidebar filters={filters} onFilterChange={setFilters} />
              </div>
            </aside>
          )}

          {/* Mobile sidebar */}
          {showFilters && (
            <aside className="mb-4 w-full lg:hidden">
              <FilterSidebar filters={filters} onFilterChange={setFilters} />
            </aside>
          )}

          {/* Job List */}
          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredJobs.length}</span>{" "}
                {filteredJobs.length === 1 ? "role" : "roles"} found
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted lg:flex"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                  <p className="text-sm font-medium text-foreground">Loading high-growth roles...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job, i) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={i}
                    onCompanyClick={setSelectedCompanyId}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                  <p className="text-sm font-medium text-foreground">No roles match your filters</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
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
