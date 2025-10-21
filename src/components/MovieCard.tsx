import { Movie, Showtime } from "@/types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Clock, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MovieCardProps {
  movie: Movie;
  showtimes: Showtime[];
}

export const MovieCard = ({ movie, showtimes }: MovieCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden bg-card border border-border/50 shadow-card hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl || "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1 font-bold">
            <Star className="w-4 h-4 fill-current" />
            {movie.rating}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{movie.title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-accent font-medium">{movie.genre || "Unknown"}</span>
            {movie.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {movie.durationMinutes} min
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {movie.description || "No description available."}
        </p>

        {/* Showtimes */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Showtimes
          </p>
          <div className="flex flex-wrap gap-2">
            {showtimes.length > 0 ? (
              showtimes.slice(0, 3).map((showtime) => (
                <Button
                  key={showtime.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/booking/${movie.id}/${showtime.id}`)}
                  className="text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {showtime.time?.slice(0, 5)} {/* Show time only, like "18:30" */}
                </Button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No showtimes available</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
