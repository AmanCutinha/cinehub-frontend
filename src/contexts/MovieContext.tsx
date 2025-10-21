import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie, Showtime, Reservation } from '@/types';

interface MovieContextType {
  movies: Movie[];
  showtimes: Showtime[];
  reservations: Reservation[];
  addMovie: (movie: Omit<Movie, 'id'>) => void;
  updateMovie: (id: string, movie: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  addShowtime: (showtime: Omit<Showtime, 'id'>) => void;
  updateShowtime: (id: string, showtime: Partial<Showtime>) => void;
  deleteShowtime: (id: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id' | 'bookingDate'>) => void;
  getMovieShowtimes: (movieId: string) => Showtime[];
  getUserReservations: (userId: string) => Reservation[];
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

// Initial mock data
const initialMovies: Movie[] = [
  {
    id: '1',
    title: 'The Dark Night',
    genre: 'Action',
    duration: 152,
    rating: 9.0,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    description: 'A thrilling action movie that keeps you on the edge of your seat.',
  },
  {
    id: '2',
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.8,
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    description: 'A mind-bending journey through dreams within dreams.',
  },
  {
    id: '3',
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    duration: 99,
    rating: 8.1,
    poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
    description: 'A whimsical comedy set in a legendary European hotel.',
  },
];

const initialShowtimes: Showtime[] = [
  { id: 's1', movieId: '1', time: '14:00', date: '2025-10-03', availableSeats: 50, totalSeats: 100, price: 12.99 },
  { id: 's2', movieId: '1', time: '18:30', date: '2025-10-03', availableSeats: 30, totalSeats: 100, price: 15.99 },
  { id: 's3', movieId: '1', time: '21:00', date: '2025-10-03', availableSeats: 75, totalSeats: 100, price: 15.99 },
  { id: 's4', movieId: '2', time: '15:30', date: '2025-10-03', availableSeats: 40, totalSeats: 80, price: 12.99 },
  { id: 's5', movieId: '2', time: '19:00', date: '2025-10-03', availableSeats: 20, totalSeats: 80, price: 15.99 },
  { id: 's6', movieId: '3', time: '16:00', date: '2025-10-03', availableSeats: 60, totalSeats: 80, price: 10.99 },
];

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('cinehub_movies');
    return saved ? JSON.parse(saved) : initialMovies;
  });

  const [showtimes, setShowtimes] = useState<Showtime[]>(() => {
    const saved = localStorage.getItem('cinehub_showtimes');
    return saved ? JSON.parse(saved) : initialShowtimes;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('cinehub_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cinehub_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cinehub_showtimes', JSON.stringify(showtimes));
  }, [showtimes]);

  useEffect(() => {
    localStorage.setItem('cinehub_reservations', JSON.stringify(reservations));
  }, [reservations]);

  const addMovie = (movie: Omit<Movie, 'id'>) => {
    const newMovie = { ...movie, id: Date.now().toString() };
    setMovies([...movies, newMovie]);
  };

  const updateMovie = (id: string, movieUpdate: Partial<Movie>) => {
    setMovies(movies.map(m => m.id === id ? { ...m, ...movieUpdate } : m));
  };

  const deleteMovie = (id: string) => {
    setMovies(movies.filter(m => m.id !== id));
    setShowtimes(showtimes.filter(s => s.movieId !== id));
  };

  const addShowtime = (showtime: Omit<Showtime, 'id'>) => {
    const newShowtime = { ...showtime, id: Date.now().toString() };
    setShowtimes([...showtimes, newShowtime]);
  };

  const updateShowtime = (id: string, showtimeUpdate: Partial<Showtime>) => {
    setShowtimes(showtimes.map(s => s.id === id ? { ...s, ...showtimeUpdate } : s));
  };

  const deleteShowtime = (id: string) => {
    setShowtimes(showtimes.filter(s => s.id !== id));
  };

  const addReservation = (reservation: Omit<Reservation, 'id' | 'bookingDate'>) => {
    const movie = movies.find(m => m.id === reservation.movieId);
    const showtime = showtimes.find(s => s.id === reservation.showtimeId);
    
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString(),
      bookingDate: new Date().toISOString(),
      movieTitle: movie?.title,
      showtime: showtime ? `${showtime.date} ${showtime.time}` : '',
    };

    setReservations([...reservations, newReservation]);
    
    // Update available seats
    if (showtime) {
      updateShowtime(reservation.showtimeId, {
        availableSeats: showtime.availableSeats - reservation.seats,
      });
    }
  };

  const getMovieShowtimes = (movieId: string) => {
    return showtimes.filter(s => s.movieId === movieId);
  };

  const getUserReservations = (userId: string) => {
    return reservations.filter(r => r.userId === userId);
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        showtimes,
        reservations,
        addMovie,
        updateMovie,
        deleteMovie,
        addShowtime,
        updateShowtime,
        deleteShowtime,
        addReservation,
        getMovieShowtimes,
        getUserReservations,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within MovieProvider');
  }
  return context;
};
