import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

import { FilterSectionProps } from "./types";

const FilterSection = ({
    filters,
    onFilterChange,
    showFilters,
    onToggleFilters,
    jobCount,
    activeFilterCount,
}: FilterSectionProps) => {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    return (
        <>
            {/* Sidebar - Desktop only */}
            <aside className={`hidden shrink-0 lg:block transition-all duration-300 ${showFilters ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
                <div className="sticky top-20">
                    <FilterSidebar filters={filters} onFilterChange={onFilterChange} />
                </div>
            </aside>

            {/* Top Bar for Results & Toggles */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
                <div>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{jobCount}</span>{" "}
                        {jobCount === 1 ? "role" : "roles"} found
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mobile filter trigger */}
                    <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95">
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
                            <FilterSidebar filters={filters} onFilterChange={onFilterChange} />
                            <div className="mt-8">
                                <button
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    Show {jobCount} roles
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Desktop Top Bar (only job count and toggle) */}
            <div className="hidden lg:flex mb-6 items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{jobCount}</span>{" "}
                    {jobCount === 1 ? "role" : "roles"} found
                </p>
                <button
                    onClick={onToggleFilters}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95"
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
        </>
    );
};

export default FilterSection;
