import rocketDots from "@/assets/rocket-dots.png";
import SearchBar from "@/components/SearchBar";

interface HeroSectionProps {
    search: string;
    onSearchChange: (value: string) => void;
}

const HeroSection = ({ search, onSearchChange }: HeroSectionProps) => {
    return (
        <section className="relative overflow-hidden border-b border-border bg-background">
            {/* Background accents */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            {/* Radial glow */}
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

            {/* Dotted rocket illustration - right side */}
            <div className="absolute right-8 top-1/2 -translate-y-[42%] hidden lg:flex items-center justify-center">
                <img src={rocketDots} alt="" className="h-[28rem] w-[26rem] object-contain opacity-[0.12]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Find your next role at a{" "}
                    <span className="text-primary">high-growth startup</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                    Signal-driven job discovery. Filter by funding stage, investor quality,
                    and growth signals to find the best opportunities.
                </p>
                <div className="mt-5 max-w-xl">
                    <SearchBar value={search} onChange={onSearchChange} />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
