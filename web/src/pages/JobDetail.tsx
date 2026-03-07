import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, ExternalLink, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import SignalBadge from "@/components/SignalBadge";
import { formatFunding } from "@/data/mockJobs";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import GlassdoorRating from "@/components/GlassdoorRating";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const posted = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return fmt(max!);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { data: jobs = [], isLoading } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Loading role details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">Job not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This role may have been removed or the link is invalid.</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Back to all roles
          </Button>
        </div>
      </div>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const company = job.company;

  // Render markdown-like description (bold, bullets, newlines)
  const renderDescription = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.trim() === "") return <br key={i} />;

      // Bold headings like **What you'll do**
      const boldMatch = line.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) {
        return (
          <h3 key={i} className="mt-6 mb-2 text-sm font-semibold text-foreground">
            {boldMatch[1]}
          </h3>
        );
      }

      // Bullet points
      if (line.trim().startsWith("- ")) {
        return (
          <li key={i} className="ml-4 text-sm leading-relaxed text-muted-foreground list-disc">
            {line.trim().substring(2)}
          </li>
        );
      }

      // Regular paragraph
      return (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all roles
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header card */}
          <div className="rounded-lg border border-border bg-card p-5 sm:p-8">
            {/* Top row: title + apply */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3 sm:gap-4">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-12 w-12 shrink-0 rounded-lg border border-border bg-muted object-contain sm:h-14 sm:w-14"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f5c518&color=111&bold=true&size=56`;
                  }}
                />
                <div>
                  <h1 className="text-lg font-bold text-foreground sm:text-xl">{job.title}</h1>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted-foreground">{company.name}</p>
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
              <Button
                variant="outline"
                className="shrink-0 self-start"
                onClick={() => window.open(company.careerUrl, "_blank")}
              >
                View all careers
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {job.roleType}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              {salary && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  {salary}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Posted {formatDate(job.postedAt)}
              </span>
            </div>

            {/* Signals */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.remote === "Remote" && <SignalBadge type="remote" label="Remote" />}
              {job.remote === "Hybrid" && <SignalBadge type="remote" label="Hybrid" />}
              {job.signals.map((signal, i) => (
                <SignalBadge key={i} type={signal.type} label={signal.label} />
              ))}
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {job.experienceLevel}
              </span>
            </div>

            {/* Skills */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8">
            <h2 className="text-base font-semibold text-foreground">About this role</h2>
            <div className="mt-4">{renderDescription(job.description)}</div>
          </div>

          {/* Company info */}
          <div className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8">
            <h2 className="text-base font-semibold text-foreground">About {company.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{company.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Founded</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{company.founded}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Employees</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{company.employeeCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Funding</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatFunding(company.totalFunding)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stage</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{company.fundingStage}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Investors</p>
              <p className="mt-1 text-sm text-foreground">{company.investors.join(" · ")}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => window.open(company.careerUrl, "_blank")}>
                Careers page
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(company.linkedinUrl, "_blank")}>
                LinkedIn
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              onClick={() => window.open(company.careerUrl, "_blank")}
            >
              View all careers
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetail;
