import rocketDotsWhite from "@/assets/rocket-dots-white.png";
import SearchBar from "@/components/SearchBar";

interface HeroSectionProps {
    search: string;
    onSearchChange: (value: string) => void;
}

const HeroSection = ({ search, onSearchChange }: HeroSectionProps) => {
    return (
        <section className="relative overflow-hidden border-b border-primary">
            {/* Bold yellow background */}
            <div className="absolute inset-0 bg-primary" />
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
                {/* Dotted rocket illustration - spans the right half of the container and perfectly centers the rocket inside it */}
                <div className="absolute left-1/2 right-0 top-1/2 -translate-y-[42%] hidden lg:flex items-center justify-center pointer-events-none z-0">
                    <img src={rocketDotsWhite} alt="Rocket" className="h-[24rem] w-[24rem] xl:h-[28rem] xl:w-[28rem] object-contain opacity-60" />
                </div>

                <div className="relative z-10">
                    <h1 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
                        Find your next role at a{" "}
                        <span className="text-background">high-growth startup</span>
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                        Signal-driven job discovery. Filter by funding stage, investor quality,
                        and growth signals to find the best opportunities.
                    </p>
                    <div className="mt-5 max-w-xl">
                        <SearchBar value={search} onChange={onSearchChange} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
