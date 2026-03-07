import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import JobCard from "@/components/JobCard";

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

import { JobListSectionProps } from "./types";

const SKELETON_COUNT = 5;

const JobListSection = ({ jobs, isLoading, onCompanyClick }: JobListSectionProps) => {
    return (
        <div className="space-y-4">
            {isLoading ? (
                Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))
            ) : (
                <AnimatePresence mode="popLayout">
                    {jobs.length > 0 ? (
                        jobs.map((job, i) => (
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
                                    onCompanyClick={onCompanyClick}
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
    );
};

export default JobListSection;
export { JobCardSkeleton };
