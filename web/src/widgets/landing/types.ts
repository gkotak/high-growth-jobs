import { Job } from "@/data/mockJobs";

export interface FilterState {
    roleType: string[];
    experienceLevel: string[];
    remote: string[];
    fundingStage: string[];
    investorTier: boolean;
}

export interface FilterSectionProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    jobCount: number;
    activeFilterCount: number;
}

export interface JobListSectionProps {
    jobs: Job[];
    isLoading: boolean;
    onCompanyClick: (id: string) => void;
}
