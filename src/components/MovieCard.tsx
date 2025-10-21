import { Movie, Showtime } from '@/types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
  showtimes: Showtime[];
}

export const MovieCard = ({ movie, showtimes }: MovieCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden bg-gradient-card shadow-card hover:shadow-cinema transition-all duration-300 hover:scale-105 border-border/50">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1 font-bold">
          <Star className="w-4 h-4 fill-current" />
          {movie.rating}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{movie.title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-accent font-medium">{movie.genre}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration} min
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>

        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Showtimes</p>
          <div className="flex flex-wrap gap-2">
            {showtimes.length > 0 ? (
              showtimes.slice(0, 3).map((showtime) => (
                <Button
                  key={showtime.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/booking/${movie.id}/${showtime.id}`)}
                  className="text-xs"
                >
                  {showtime.time}
                </Button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No showtimes available</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
