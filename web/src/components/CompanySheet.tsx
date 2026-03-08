import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Linkedin, Calendar, Users, DollarSign, Globe } from "lucide-react";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    stroke="none"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import type { Company } from "@/data/mockJobs";
import { formatFunding } from "@/data/mockJobs";
import GlassdoorRating from "@/components/GlassdoorRating";

interface CompanySheetProps {
  company: Company | null;
  onClose: () => void;
}

const CompanySheet = ({ company, onClose }: CompanySheetProps) => {
  return (
    <AnimatePresence>
      {company && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-border bg-background shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-14 w-14 rounded-xl border border-border bg-muted object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f5c518&color=111&bold=true&size=56`;
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        {company.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                    <div className="mt-1.5">
                      <GlassdoorRating rating={company.glassdoorRating} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Description */}
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {company.description}
              </p>

              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Employees"
                  value={company.employeeCount}
                />
                <StatCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Total Funding"
                  value={formatFunding(company.totalFunding)}
                />
                <StatCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Most Recent"
                  value={company.lastFundingAmount || "Unknown"}
                />
                <StatCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="Founded"
                  value={String(company.founded)}
                />
              </div>

              {/* Investors */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Investors
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {company.investors.map((investor) => (
                    <span
                      key={investor}
                      className="signal-badge-tier1"
                    >
                      {investor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={company.careerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Careers
                </a>

                <div className="flex items-center gap-2">
                  {company.linkedinUrl && (
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {company.twitterUrl && (
                    <a
                      href={company.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Twitter / X"
                    >
                      <TwitterIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg border border-border bg-muted/50 p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default CompanySheet;
