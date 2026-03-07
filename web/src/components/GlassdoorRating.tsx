import { Star } from "lucide-react";

interface GlassdoorRatingProps {
  rating: number;
}

const GlassdoorRating = ({ rating }: GlassdoorRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const totalFilled = hasHalf ? fullStars + 1 : fullStars;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-foreground">Glassdoor</span>
      <span className="text-xs text-muted-foreground">({rating.toFixed(1)})</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={
              i < totalFilled
                ? "h-3.5 w-3.5 fill-[#0caa41] text-[#0caa41]"
                : "h-3.5 w-3.5 fill-muted text-muted"
            }
          />
        ))}
      </div>
    </div>
  );
};

export default GlassdoorRating;
