import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMovies } from '@/contexts/MovieContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Film, Clock, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Movie, Showtime } from '@/types';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { movies, showtimes, reservations, addMovie, updateMovie, deleteMovie, addShowtime, updateShowtime, deleteShowtime } = useMovies();
  
  const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false);
  const [isShowtimeDialogOpen, setIsShowtimeDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);

  // Movie form state
  const [movieForm, setMovieForm] = useState({
    title: '',
    genre: '',
    duration: '',
    rating: '',
    poster: '',
    description: '',
  });

  // Showtime form state
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    time: '',
    date: '',
    totalSeats: '',
    price: '',
  });

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleAddMovie = () => {
    if (!movieForm.title || !movieForm.genre || !movieForm.duration || !movieForm.rating) {
      toast.error('Please fill all required fields');
      return;
    }

    const movieData = {
      ...movieForm,
      duration: parseInt(movieForm.duration),
      rating: parseFloat(movieForm.rating),
    };

    if (editingMovie) {
      updateMovie(editingMovie.id, movieData);
      toast.success('Movie updated successfully');
    } else {
      addMovie(movieData);
      toast.success('Movie added successfully');
    }

    setMovieForm({ title: '', genre: '', duration: '', rating: '', poster: '', description: '' });
    setEditingMovie(null);
    setIsMovieDialogOpen(false);
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration.toString(),
      rating: movie.rating.toString(),
      poster: movie.poster,
      description: movie.description,
    });
    setIsMovieDialogOpen(true);
  };

  const handleDeleteMovie = (id: string) => {
    if (confirm('Are you sure you want to delete this movie? All associated showtimes will also be deleted.')) {
      deleteMovie(id);
      toast.success('Movie deleted successfully');
    }
  };

  const handleAddShowtime = () => {
    if (!showtimeForm.movieId || !showtimeForm.time || !showtimeForm.date || !showtimeForm.totalSeats || !showtimeForm.price) {
      toast.error('Please fill all required fields');
      return;
    }

    const showtimeData = {
      ...showtimeForm,
      totalSeats: parseInt(showtimeForm.totalSeats),
      availableSeats: parseInt(showtimeForm.totalSeats),
      price: parseFloat(showtimeForm.price),
    };

    if (editingShowtime) {
      updateShowtime(editingShowtime.id, {
        ...showtimeData,
        availableSeats: editingShowtime.availableSeats,
      });
      toast.success('Showtime updated successfully');
    } else {
      addShowtime(showtimeData);
      toast.success('Showtime added successfully');
    }

    setShowtimeForm({ movieId: '', time: '', date: '', totalSeats: '', price: '' });
    setEditingShowtime(null);
    setIsShowtimeDialogOpen(false);
  };

  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowtimeForm({
      movieId: showtime.movieId,
      time: showtime.time,
      date: showtime.date,
      totalSeats: showtime.totalSeats.toString(),
      price: showtime.price.toString(),
    });
    setIsShowtimeDialogOpen(true);
  };

  const handleDeleteShowtime = (id: string) => {
    if (confirm('Are you sure you want to delete this showtime?')) {
      deleteShowtime(id);
      toast.success('Showtime deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage movies, showtimes, and reservations</p>
        </div>

        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="bg-card/50">
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="showtimes">Showtimes</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Movies</h2>
                <Dialog open={isMovieDialogOpen} onOpenChange={setIsMovieDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="cinema" onClick={() => { setEditingMovie(null); setMovieForm({ title: '', genre: '', duration: '', rating: '', poster: '', description: '' }); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Movie
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="genre">Genre *</Label>
                          <Input id="genre" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Duration (mins) *</Label>
                          <Input id="duration" type="number" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="rating">Rating *</Label>
                          <Input id="rating" type="number" step="0.1" max="10" value={movieForm.rating} onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="poster">Poster URL</Label>
                          <Input id="poster" value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} />
                      </div>
                      <Button onClick={handleAddMovie} variant="cinema">{editingMovie ? 'Update' : 'Add'} Movie</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movies.map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell className="font-medium">{movie.title}</TableCell>
                      <TableCell>{movie.genre}</TableCell>
                      <TableCell>{movie.duration} min</TableCell>
                      <TableCell>{movie.rating}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditMovie(movie)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteMovie(movie.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="showtimes" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Showtimes</h2>
                <Dialog open={isShowtimeDialogOpen} onOpenChange={setIsShowtimeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="cinema" onClick={() => { setEditingShowtime(null); setShowtimeForm({ movieId: '', time: '', date: '', totalSeats: '', price: '' }); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Showtime
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>{editingShowtime ? 'Edit Showtime' : 'Add New Showtime'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="movieId">Movie *</Label>
                        <select
                          id="movieId"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={showtimeForm.movieId}
                          onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                        >
                          <option value="">Select a movie</option>
                          {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Date *</Label>
                          <Input id="date" type="date" value={showtimeForm.date} onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="time">Time *</Label>
                          <Input id="time" type="time" value={showtimeForm.time} onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="totalSeats">Total Seats *</Label>
                          <Input id="totalSeats" type="number" value={showtimeForm.totalSeats} onChange={(e) => setShowtimeForm({ ...showtimeForm, totalSeats: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price ($) *</Label>
                          <Input id="price" type="number" step="0.01" value={showtimeForm.price} onChange={(e) => setShowtimeForm({ ...showtimeForm, price: e.target.value })} />
                        </div>
                      </div>
                      <Button onClick={handleAddShowtime} variant="cinema">{editingShowtime ? 'Update' : 'Add'} Showtime</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Available Seats</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showtimes.map((showtime) => {
                    const movie = movies.find(m => m.id === showtime.movieId);
                    return (
                      <TableRow key={showtime.id}>
                        <TableCell className="font-medium">{movie?.title}</TableCell>
                        <TableCell>{showtime.date}</TableCell>
                        <TableCell>{showtime.time}</TableCell>
                        <TableCell>{showtime.availableSeats}/{showtime.totalSeats}</TableCell>
                        <TableCell>${showtime.price}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditShowtime(showtime)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteShowtime(showtime.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">All Reservations</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reservation ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Movie</TableHead>
                    <TableHead>Showtime</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Booking Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.id}</TableCell>
                      <TableCell>{reservation.userId}</TableCell>
                      <TableCell className="font-medium">{reservation.movieTitle}</TableCell>
                      <TableCell>{reservation.showtime}</TableCell>
                      <TableCell>{reservation.seats}</TableCell>
                      <TableCell>${reservation.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>{new Date(reservation.bookingDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {reservations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No reservations yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
