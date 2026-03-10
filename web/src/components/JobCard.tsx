import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Job } from "@/data/mockJobs";
import SignalBadge from "./SignalBadge";
import { formatDisplaySalary } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  index: number;
  onCompanyClick: (companyId: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const posted = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const JobCard = ({ job, index, onCompanyClick }: JobCardProps) => {
  const salary = formatDisplaySalary(job);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="group hover-lift rounded-lg border border-border bg-card p-4 sm:p-5 cursor-pointer"
      onClick={() => navigate(`/job/${job.id}`)}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Company Logo */}
        <img
          src={job.company.logo}
          alt={job.company.name}
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-lg border border-border bg-muted object-contain sm:h-12 sm:w-12"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company.name)}&background=f5c518&color=111&bold=true&size=48`;
          }}
        />

        <div className="min-w-0 flex-1">
          {/* Title + Meta Row */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors sm:text-base">
                {job.title}
              </h3>
              <button
                onClick={(e) => { e.stopPropagation(); onCompanyClick(job.company.id); }}
                className="mt-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors sm:text-sm"
              >
                {job.company.name}
              </button>
            </div>

            {salary && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground sm:text-sm">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                {salary}
              </span>
            )}
          </div>

          {/* Location + Time */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(job.postedAt)}
            </span>
          </div>

          {/* Signals */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.remote === "Remote" && (
              <SignalBadge type="remote" label="Remote" />
            )}
            {job.signals.map((signal, i) => (
              <SignalBadge key={i} type={signal.type} label={signal.label} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
