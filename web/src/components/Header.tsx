import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="HighGrowthJobs logo" className="h-14 w-auto object-contain" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            HighGrowthJobs
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:block">
            1,600+ roles at VC-backed startups
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;