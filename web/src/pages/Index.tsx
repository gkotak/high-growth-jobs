import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import rocketDots from "@/assets/rocket-dots.png";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import JobCard from "@/components/JobCard";
import CompanySheet from "@/components/CompanySheet";
import { useJobs } from "@/hooks/useJobs";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
const TOP_TIER_VCS = [
  "Sequoia Capital", "a16z", "Benchmark", "Founders Fund", "Accel",
  "Greylock", "Kleiner Perkins", "Index Ventures", "General Catalyst",
  "Tiger Global", "Thrive Capital", "Coatue Management",
];

const JobCardSkeleton = () => (
  <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
    <div className="flex gap-3 sm:gap-4">
      <Skeleton className="h-10 w-10 rounded-lg sm:h-12 sm:w-12" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    roleType: [] as string[],
    experienceLevel: [] as string[],
    remote: [] as string[],
    fundingStage: [] as string[],
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop only */}
          <aside className={`hidden shrink-0 lg:block transition-all duration-300 ${showFilters ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
            <div className="sticky top-20">
              <FilterSidebar filters={filters} onFilterChange={setFilters} />
            </div>
          </aside>

          {/* Job List */}
          <main className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredJobs.length}</span>{" "}
                  {filteredJobs.length === 1 ? "role" : "roles"} found
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter trigger */}
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95 lg:hidden">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xs">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Narrow down your search by role, stage, and signals.
                      </SheetDescription>
                    </SheetHeader>
                    <FilterSidebar filters={filters} onFilterChange={setFilters} />
                    <div className="mt-8">
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Show {filteredJobs.length} roles
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95 lg:flex"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                  {!showFilters && activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, i) => (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                      >
                        <JobCard
                          job={job}
                          index={i}
                          onCompanyClick={setSelectedCompanyId}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center"
                    >
                      <p className="text-base font-semibold text-foreground">No roles match your filters</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your search or clearing some filters to see more opportunities.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
