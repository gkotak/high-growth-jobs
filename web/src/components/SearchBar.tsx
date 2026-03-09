import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative group transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 rounded-lg">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input
        type="text"
        placeholder="Search by title, company, or skill..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-11 text-base bg-background/50 border-border focus-visible:ring-primary shadow-sm hover:bg-background transition-all"
      />
    </div>
  );
};

export default SearchBar;
