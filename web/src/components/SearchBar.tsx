import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by title, company, or skill..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-10 text-sm bg-background border-border focus-visible:ring-primary"
      />
    </div>
  );
};

export default SearchBar;
