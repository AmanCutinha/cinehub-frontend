import { useState, useMemo } from 'react';
import { MovieCard } from '@/components/MovieCard';
import { Navbar } from '@/components/Navbar';
import { useMovies } from '@/contexts/MovieContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

const Index = () => {
  const { movies, getMovieShowtimes } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const genres = useMemo(() => {
    const uniqueGenres = Array.from(new Set(movies.map(m => m.genre)));
    return ['all', ...uniqueGenres];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movie.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = genreFilter === 'all' || movie.genre === genreFilter;
      const matchesRating = ratingFilter === 'all' || 
                          (ratingFilter === 'high' && movie.rating >= 8.0) ||
                          (ratingFilter === 'medium' && movie.rating >= 6.0 && movie.rating < 8.0) ||
                          (ratingFilter === 'low' && movie.rating < 6.0);
      
      return matchesSearch && matchesGenre && matchesRating;
    });
  }, [movies, searchTerm, genreFilter, ratingFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-hero py-20 px-4 mb-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=600&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to CineHub
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
            Book your favorite movies with ease. Enjoy the best cinema experience.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Filter Movies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="high">8.0+ Stars</SelectItem>
                <SelectItem value="medium">6.0 - 7.9 Stars</SelectItem>
                <SelectItem value="low">Below 6.0</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showtimes={getMovieShowtimes(movie.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No movies found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
