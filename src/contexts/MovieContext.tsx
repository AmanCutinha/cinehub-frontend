import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Movie, Showtime } from "@/types";
import { getShowtimesByMovie } from "@/services/showtimeService";

export interface Reservation {
  id: number;
  userEmail: string;
  movie: Movie;
  seats: number;
  totalPrice: number;
  bookingTime: string; // ISO string
}

interface MovieContextType {
  movies: Movie[];
  showtimes: Showtime[];
  loading: boolean;
  error: string | null;
  fetchMovies: () => Promise<void>;
  fetchShowtimes: (movieId: number) => Promise<void>;
  getMovieShowtimes: (movieId: number) => Showtime[];
  addMovie: (movie: Omit<Movie, "id">) => Promise<void>;
  updateMovie: (id: number, movie: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: number) => Promise<void>;

  // Reservations
  reservations: Reservation[];
  fetchReservations: () => Promise<void>;
  addReservation: (payload: {
    movieId: number;
    userEmail: string;
    seats: number;
    totalPrice: number;
  }) => Promise<Reservation | null>;
  getUserReservationsByEmail: (email: string) => Reservation[];
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:8081/api";
  const MOVIES_API = `${API_BASE}/movies`;
  const BOOKINGS_API = `${API_BASE}/bookings`;

  // --- Movies CRUD ---
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Movie[]>(MOVIES_API);
      setMovies(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  const addMovie = async (movie: Omit<Movie, "id">) => {
    try {
      const res = await axios.post<Movie>(MOVIES_API, movie);
      setMovies(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding movie:", err);
      throw err;
    }
  };

  const updateMovie = async (id: number, movie: Partial<Movie>) => {
    try {
      const res = await axios.put<Movie>(`${MOVIES_API}/${id}`, movie);
      setMovies(prev => prev.map(m => (m.id === id ? { ...m, ...res.data } : m)));
    } catch (err) {
      console.error("Error updating movie:", err);
      throw err;
    }
  };

  const deleteMovie = async (id: number) => {
    try {
      await axios.delete(`${MOVIES_API}/${id}`);
      setMovies(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error deleting movie:", err);
      throw err;
    }
  };

  // --- Showtimes ---
  const fetchShowtimes = async (movieId: number) => {
    try {
      const data = await getShowtimesByMovie(movieId);
      // replace showtimes for the movieId
      setShowtimes(prev => [
        ...prev.filter((s) => s.movie.id !== movieId),
        ...data,
      ]);
    } catch (err) {
      console.error("Failed to fetch showtimes:", err);
    }
  };

  const getMovieShowtimes = (movieId: number) => {
    return showtimes.filter((s) => s.movie.id === movieId);
  };

  // --- Reservations (bookings) ---
  const fetchReservations = async () => {
    try {
      const res = await axios.get<Reservation[]>(BOOKINGS_API);
      setReservations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
    }
  };

  /**
   * Create reservation on backend AND update local reservations state.
   * Backend expected payload: { movieId, userEmail, seats, totalPrice }
   * Always re-fetchs reservations after create to keep state in sync with backend.
   */
  const addReservation = async (payload: {
    movieId: number;
    userEmail: string;
    seats: number;
    totalPrice: number;
  }): Promise<Reservation | null> => {
    try {
      const res = await axios.post<Reservation>(BOOKINGS_API, payload);

      // debug log for backend response
      console.log("addReservation: backend response:", res.data);

      if (res.data && Object.keys(res.data).length) {
        // optimistically add created reservation then re-sync
        setReservations(prev => [res.data!, ...prev]);
        await fetchReservations();
        return res.data!;
      }

      // fallback: re-fetch to sync state
      await fetchReservations();

      // attempt to find a matching reservation in the freshly fetched list
      const matched = reservations.find(r =>
        r.movie?.id === payload.movieId &&
        r.userEmail === payload.userEmail &&
        r.seats === payload.seats &&
        Math.abs((r.totalPrice || 0) - payload.totalPrice) < 0.001
      );
      return matched || null;
    } catch (err) {
      console.error("Failed to create reservation:", err);
      // try re-sync anyway
      try { await fetchReservations(); } catch (_) {}
      return null;
    }
  };

  const getUserReservationsByEmail = (email: string) => {
    if (!email) return [];
    return reservations.filter(r => r.userEmail?.toLowerCase() === email.toLowerCase());
  };

  // load initial data
  useEffect(() => {
    fetchMovies();
    fetchReservations();
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

        reservations,
        fetchReservations,
        addReservation,
        getUserReservationsByEmail,
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