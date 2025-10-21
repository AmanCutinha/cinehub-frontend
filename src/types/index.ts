export interface Movie {
  id: number;
  title: string;
  genre?: string;
  rating?: number;
  description?: string;
  releaseDate?: string;
  durationMinutes?: number;
  language?: string;
  posterUrl?: string;
}


export interface Showtime {
  id: number;
  movie: Movie;
  date: string;       // e.g. "2025-10-22"
  time: string;       // e.g. "19:30:00"
  totalSeats: number;
  availableSeats: number;
  price: number;
}


export interface Reservation {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  seats: number;
  totalPrice: number;
  bookingDate: string;
  movieTitle?: string;
  showtime?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
