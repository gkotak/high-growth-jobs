import type { Signal } from "@/data/mockJobs";

interface SignalBadgeProps {
  type: Signal["type"] | "remote";
  label: string;
}

const badgeClasses: Record<string, string> = {
  tier1_vc: "signal-badge-tier1",
  series: "signal-badge-series",
  remote: "signal-badge-remote",
  funding: "signal-badge-funding",
};

const SignalBadge = ({ type, label }: SignalBadgeProps) => {
  return (
    <span className={badgeClasses[type] || "signal-badge"}>
      {type === "tier1_vc" && "⭐ "}
      {label}
    </span>
  );
};

export default SignalBadge;
