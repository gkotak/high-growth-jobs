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
        className="h-14 pl-12 text-base bg-white border-border/80 focus-visible:ring-primary shadow-md hover:shadow-lg transition-all rounded-xl"
      />
    </div>
  );
};

export default SearchBar;
