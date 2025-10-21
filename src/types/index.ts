export interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  poster: string;
  description: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  time: string;
  date: string;
  availableSeats: number;
  totalSeats: number;
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
