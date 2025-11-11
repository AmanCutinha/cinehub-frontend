import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Movie } from "@/types";

const MOVIES_API = "http://localhost:8081/api/movies";
const SHOWTIMES_API = "http://localhost:8081/api/showtimes";
const USERS_API = "http://localhost:8081/api/users";
const BOOKINGS_API = "http://localhost:8081/api/bookings";

interface Showtime {
  id: number;
  movieId: number;
  date: string;
  time: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
}

interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface BookingType {
  id: number;
  userEmail: string;
  movie: {
    id: number;
    title: string;
    // other movie fields may exist but we only need title here
  };
  seats: number;
  totalPrice: number;
  bookingTime: string; // ISO string from backend
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(false);

  // Movie dialog
  const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: "",
    genre: "",
    description: "",
    durationMinutes: "",
    rating: "",
    posterUrl: "",
    language: "",
    releaseDate: "",
  });

  // Showtime dialog
  const [isShowtimeDialogOpen, setIsShowtimeDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: "",
    date: "",
    time: "",
    totalSeats: "",
    availableSeats: "",
    price: "",
  });

  // User dialog
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  // Fetch movies & showtimes & users & bookings
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(MOVIES_API);
      setMovies(res.data);
    } catch {
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const res = await axios.get(SHOWTIMES_API);
      setShowtimes(res.data);
    } catch {
      toast.error("Failed to fetch showtimes");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_API);
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(BOOKINGS_API);
      setBookings(res.data);
    } catch {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "admin") {
      navigate("/");
    } else {
      fetchMovies();
      fetchShowtimes();
      fetchUsers();
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]);

  // ------------------- MOVIES CRUD (existing working code) -------------------
  const handleAddOrEditMovie = async () => {
    if (!movieForm.title || !movieForm.genre || !movieForm.rating) {
      toast.error("Please fill all required fields");
      return;
    }

    const movieData = {
      ...movieForm,
      durationMinutes: Number(movieForm.durationMinutes) || 0,
      rating: Number(movieForm.rating) || 0,
    };

    try {
      if (editingMovie) {
        await axios.put(`${MOVIES_API}/${editingMovie.id}`, movieData);
        toast.success("Movie updated successfully");
      } else {
        await axios.post(MOVIES_API, movieData);
        toast.success("Movie added successfully");
      }

      setMovieForm({
        title: "",
        genre: "",
        description: "",
        durationMinutes: "",
        rating: "",
        posterUrl: "",
        language: "",
        releaseDate: "",
      });
      setEditingMovie(null);
      setIsMovieDialogOpen(false);
      fetchMovies();
    } catch {
      toast.error("Error saving movie");
    }
  };

  const handleEditMovie = (m: Movie) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title || "",
      genre: m.genre || "",
      description: m.description || "",
      durationMinutes: m.durationMinutes?.toString() || "",
      rating: m.rating?.toString() || "",
      posterUrl: m.posterUrl || "",
      language: m.language || "",
      releaseDate: m.releaseDate || "",
    });
    setIsMovieDialogOpen(true);
  };

  const handleDeleteMovie = async (id: number) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      await axios.delete(`${MOVIES_API}/${id}`);
      toast.success("Movie deleted");
      fetchMovies();
    }
  };

  // ------------------- SHOWTIMES CRUD (existing working code) -------------------
  const handleAddOrEditShowtime = async () => {
    if (!showtimeForm.movieId || !showtimeForm.date || !showtimeForm.time) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = {
      ...showtimeForm,
      movieId: Number(showtimeForm.movieId),
      totalSeats: Number(showtimeForm.totalSeats),
      availableSeats:
        Number(showtimeForm.availableSeats) || Number(showtimeForm.totalSeats),
      price: Number(showtimeForm.price) || 0,
    };

    try {
      if (editingShowtime) {
        await axios.put(`${SHOWTIMES_API}/${editingShowtime.id}`, data);
        toast.success("Showtime updated successfully");
      } else {
        await axios.post(SHOWTIMES_API, data);
        toast.success("Showtime added successfully");
      }
      setEditingShowtime(null);
      setIsShowtimeDialogOpen(false);
      fetchShowtimes();
    } catch {
      toast.error("Error saving showtime");
    }
  };

  const handleEditShowtime = (s: Showtime) => {
    setEditingShowtime(s);
    setShowtimeForm({
      movieId: s.movieId.toString(),
      date: s.date || "",
      time: s.time || "",
      totalSeats: s.totalSeats?.toString() || "",
      availableSeats: s.availableSeats?.toString() || "",
      price: s.price?.toString() || "",
    });
    setIsShowtimeDialogOpen(true);
  };

  const handleDeleteShowtime = async (id: number) => {
    if (confirm("Are you sure you want to delete this showtime?")) {
      await axios.delete(`${SHOWTIMES_API}/${id}`);
      toast.success("Showtime deleted");
      fetchShowtimes();
    }
  };

  // ------------------- USERS CRUD (new tab, isolated) -------------------
  const handleAddOrEditUser = async () => {
    if (!userForm.name || !userForm.email || (!editingUser && !userForm.password)) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingUser) {
        // Update user (do not send password if empty)
        const payload: any = { name: userForm.name, email: userForm.email, role: userForm.role };
        await axios.put(`${USERS_API}/${editingUser.id}`, payload);
        toast.success("User updated successfully");
      } else {
        // Create user - backend expects password field for registration
        const payload: any = { name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role };
        await axios.post(USERS_API, payload);
        toast.success("User added successfully");
      }
      setEditingUser(null);
      setUserForm({ name: "", email: "", password: "", role: "USER" });
      setIsUserDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("User save error:", err);
      toast.error("Error saving user");
    }
  };

  const handleEditUser = (u: UserType) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: "", role: u.role });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`${USERS_API}/${id}`);
      toast.success("User deleted");
      fetchUsers();
    }
  };

  // ------------------- BOOKINGS CRUD (new tab) -------------------
  const handleDeleteBooking = async (id: number) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await axios.delete(`${BOOKINGS_API}/${id}`);
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      console.error("Failed to delete booking:", err);
      toast.error("Failed to delete booking");
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">Manage Movies & Showtimes</p>

        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="bg-card/50">
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="showtimes">Showtimes</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* ---------------- MOVIES TAB (unchanged) ---------------- */}
          <TabsContent value="movies">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Movies</h2>
                <Dialog open={isMovieDialogOpen} onOpenChange={setIsMovieDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="cinema"
                      onClick={() => {
                        setEditingMovie(null);
                        setMovieForm({
                          title: "",
                          genre: "",
                          description: "",
                          durationMinutes: "",
                          rating: "",
                          posterUrl: "",
                          language: "",
                          releaseDate: "",
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Movie
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingMovie ? "Edit Movie" : "Add New Movie"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {[
                        { id: "title", label: "Title", type: "text", required: true },
                        { id: "genre", label: "Genre", type: "text", required: true },
                        { id: "durationMinutes", label: "Duration (mins)", type: "number" },
                        { id: "rating", label: "Rating", type: "number" },
                        { id: "language", label: "Language", type: "text" },
                        { id: "releaseDate", label: "Release Date", type: "date" },
                        { id: "posterUrl", label: "Poster URL", type: "text" },
                      ].map((field) => (
                        <div key={field.id} className="grid gap-2">
                          <Label htmlFor={field.id}>{field.label}{field.required ? ' *' : ''}</Label>
                          <Input
                            id={field.id}
                            type={field.type}
                            value={(movieForm as any)[field.id]}
                            onChange={(e) => setMovieForm({ ...movieForm, [field.id]: e.target.value })}
                          />
                        </div>
                      ))}

                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={movieForm.description}
                          onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                        />
                      </div>

                      <Button onClick={handleAddOrEditMovie} variant="cinema">
                        {editingMovie ? 'Update' : 'Add'} Movie
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-accent w-8 h-8" />
                </div>
              ) : (
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
                    {movies.length > 0 ? (
                      movies.map((movie) => (
                        <TableRow key={movie.id}>
                          <TableCell className="font-medium">{movie.title}</TableCell>
                          <TableCell>{movie.genre}</TableCell>
                          <TableCell>{movie.durationMinutes} min</TableCell>
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No movies available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* ---------------- SHOWTIMES TAB (unchanged) ---------------- */}
          <TabsContent value="showtimes" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Showtimes</h2>
                <Dialog open={isShowtimeDialogOpen} onOpenChange={setIsShowtimeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="cinema"
                      onClick={() => {
                        setEditingShowtime(null);
                        setShowtimeForm({
                          movieId: "",
                          date: "",
                          time: "",
                          totalSeats: "",
                          availableSeats: "",
                          price: "",
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Showtime
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-card max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingShowtime ? "Edit Showtime" : "Add Showtime"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="movieId">Movie</Label>
                      <select
                        id="movieId"
                        className="p-2 border rounded"
                        value={showtimeForm.movieId}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                      >
                        <option value="">Select Movie</option>
                        {movies.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))}
                      </select>

                      {["date", "time", "totalSeats", "availableSeats", "price"].map((field) => (
                        <div key={field} className="grid gap-2">
                          <Label htmlFor={field}>{field}</Label>
                          <Input
                            id={field}
                            type={field.includes("Seats") || field === "price" ? "number" : field}
                            value={(showtimeForm as any)[field]}
                            onChange={(e) => setShowtimeForm({ ...showtimeForm, [field]: e.target.value })}
                          />
                        </div>
                      ))}

                      <Button onClick={handleAddOrEditShowtime} variant="cinema">
                        {editingShowtime ? "Update" : "Add"} Showtime
                      </Button>
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
                    <TableHead>Seats</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showtimes.map((s) => {
                    const movie = movies.find((m) => m.id === s.movieId);
                    return (
                      <TableRow key={s.id}>
                        <TableCell>{movie?.title}</TableCell>
                        <TableCell>{s.date}</TableCell>
                        <TableCell>{s.time}</TableCell>
                        <TableCell>
                          {s.availableSeats}/{s.totalSeats}
                        </TableCell>
                        <TableCell>${s.price}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingShowtime(s);
                                setShowtimeForm({
                                  movieId: s.movieId?.toString() || "",
                                  date: s.date || "",
                                  time: s.time || "",
                                  totalSeats: s.totalSeats?.toString() || "",
                                  availableSeats: s.availableSeats?.toString() || "",
                                  price: s.price?.toString() || "",
                                });
                                setIsShowtimeDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteShowtime(s.id)}
                            >
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

          {/* ---------------- USERS TAB (NEW) ---------------- */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Users</h2>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="cinema"
                      onClick={() => {
                        setEditingUser(null);
                        setUserForm({ name: "", email: "", password: "", role: "USER" });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add User
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-card max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="userName">Name</Label>
                      <Input id="userName" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                      <Label htmlFor="userEmail">Email</Label>
                      <Input id="userEmail" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                      {!editingUser && (
                        <>
                          <Label htmlFor="userPassword">Password</Label>
                          <Input id="userPassword" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                        </>
                      )}
                      <Label>Role</Label>
                      <select className="p-2 border rounded" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <Button onClick={handleAddOrEditUser} variant="cinema">
                        {editingUser ? "Update" : "Add"} User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditUser(u)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ---------------- BOOKINGS TAB (NEW) ---------------- */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Bookings</h2>
                <div>
                  <Button variant="cinema" onClick={() => fetchBookings()}>
                    Refresh
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reservation ID</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Movie</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Booking Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.id}</TableCell>
                        <TableCell>{b.userEmail}</TableCell>
                        <TableCell className="font-medium">{b.movie?.title}</TableCell>
                        <TableCell>{b.seats}</TableCell>
                        <TableCell>${b.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>{new Date(b.bookingTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(b.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No bookings found
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