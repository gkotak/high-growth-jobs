import { X, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface FilterSidebarProps {
  filters: {
    roleType: string[];
    experienceLevel: string[];
    remote: string[];
    fundingStage: string[];
    investorTier: boolean;
  };
  onFilterChange: (filters: FilterSidebarProps["filters"]) => void;
}

const ROLE_TYPES = ["Engineering", "Product", "Design", "Sales"];
const EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior", "Lead"];
const REMOTE_OPTIONS = ["Remote", "Hybrid", "On-site"];
const FUNDING_STAGES = ["Seed", "Series A", "Series B", "Series C", "Series D", "Series E+"];

const MultiSelectDropdown = ({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-muted">
        <span className="flex items-center gap-2 truncate">
          <span className="text-muted-foreground">{title}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-xs font-semibold">
              {selected.length}
            </Badge>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => onToggle(option)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input"
                }`}
            >
              {isActive && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {option}
          </button>
        );
      })}
    </PopoverContent>
  </Popover>
);

const FilterSidebar = ({ filters, onFilterChange }: FilterSidebarProps) => {
  const toggleFilter = (
    key: "roleType" | "experienceLevel" | "remote" | "fundingStage",
    value: string
  ) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: next });
  };

  const activeCount =
    filters.roleType.length +
    filters.experienceLevel.length +
    filters.remote.length +
    filters.fundingStage.length +
    (filters.investorTier ? 1 : 0);

  const clearAll = () =>
    onFilterChange({
      roleType: [],
      experienceLevel: [],
      remote: [],
      fundingStage: [],
      investorTier: false,
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <MultiSelectDropdown
        title="Role"
        options={ROLE_TYPES}
        selected={filters.roleType}
        onToggle={(v) => toggleFilter("roleType", v)}
      />

      <MultiSelectDropdown
        title="Level"
        options={EXPERIENCE_LEVELS}
        selected={filters.experienceLevel}
        onToggle={(v) => toggleFilter("experienceLevel", v)}
      />

      <MultiSelectDropdown
        title="Remote"
        options={REMOTE_OPTIONS}
        selected={filters.remote}
        onToggle={(v) => toggleFilter("remote", v)}
      />

      <MultiSelectDropdown
        title="Funding Stage"
        options={FUNDING_STAGES}
        selected={filters.fundingStage}
        onToggle={(v) => toggleFilter("fundingStage", v)}
      />

      <button
        onClick={() =>
          onFilterChange({ ...filters, investorTier: !filters.investorTier })
        }
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-all duration-200 ${filters.investorTier
            ? "border-primary bg-primary/10 text-primary-foreground shadow-sm font-medium"
            : "border-input bg-background text-muted-foreground hover:bg-muted"
          }`}
      >
        <span className="flex items-center gap-2">
          <span className={filters.investorTier ? "text-primary" : "text-muted-foreground"}>⭐</span>
          Top Tier VCs Only
        </span>
        {filters.investorTier && <X className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

export default FilterSidebar;
