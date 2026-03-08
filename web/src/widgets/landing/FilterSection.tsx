import FilterSidebarBody from "@/components/FilterSidebar";
import { FilterSectionProps } from "./types";

const FilterSection = ({
    filters,
    onFilterChange,
    showFilters,
}: Pick<FilterSectionProps, "filters" | "onFilterChange" | "showFilters">) => {
    return (
        <aside
            className={`hidden shrink-0 lg:block transition-all duration-300 ${showFilters ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
                }`}
        >
            <div className="sticky top-20">
                <FilterSidebarBody filters={filters} onFilterChange={onFilterChange} />
            </div>
        </aside>
    );
};

export default FilterSection;
