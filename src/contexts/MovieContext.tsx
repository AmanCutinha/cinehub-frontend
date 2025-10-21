import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Movie, Showtime } from "@/types";
import { getShowtimesByMovie } from "@/services/showtimeService";

interface MovieContextType {
  movies: Movie[];
  showtimes: Showtime[];
  loading: boolean;
  error: string | null;
  fetchMovies: () => void;
  fetchShowtimes: (movieId: number) => Promise<void>;
  getMovieShowtimes: (movieId: number) => Showtime[];
  addMovie: (movie: Omit<Movie, "id">) => Promise<void>;
  updateMovie: (id: number, movie: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: number) => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const movieURL = "http://localhost:8081/api/movies";

  // ✅ Fetch all movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Movie[]>(movieURL);
      setMovies(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch showtimes for a movie
  const fetchShowtimes = async (movieId: number) => {
    try {
      const data = await getShowtimesByMovie(movieId);
      setShowtimes((prev) => [
        ...prev.filter((s) => s.movie.id !== movieId),
        ...data,
      ]);
    } catch (err) {
      console.error("Failed to fetch showtimes:", err);
    }
  };

  // ✅ Get showtimes for a specific movie (used by frontend)
  const getMovieShowtimes = (movieId: number) => {
    return showtimes.filter((s) => s.movie.id === movieId);
  };

  // ✅ Add new movie
  const addMovie = async (movie: Omit<Movie, "id">) => {
    try {
      const response = await axios.post<Movie>(movieURL, movie);
      setMovies((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Error adding movie:", err);
    }
  };

  // ✅ Update movie
  const updateMovie = async (id: number, movie: Partial<Movie>) => {
    try {
      const response = await axios.put<Movie>(`${movieURL}/${id}`, movie);
      setMovies((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...response.data } : m))
      );
    } catch (err) {
      console.error("Error updating movie:", err);
    }
  };

  // ✅ Delete movie
  const deleteMovie = async (id: number) => {
    try {
      await axios.delete(`${movieURL}/${id}`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <MovieContext.Provider
      value={{
        movies,
        showtimes,
        loading,
        error,
        fetchMovies,
        fetchShowtimes,
        getMovieShowtimes,
        addMovie,
        updateMovie,
        deleteMovie,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) throw new Error("useMovies must be used within a MovieProvider");
  return context;
};
