import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useMovies } from "@/contexts/MovieContext";
import { useAuth } from "@/contexts/AuthContext";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { reservations, fetchReservations, getUserReservationsByEmail } = useMovies();
  const { user } = useAuth();

  const userEmail = user?.email ?? "";
  const [bookings, setBookings] = useState<typeof reservations>([]);

  useEffect(() => {
    // ensure we have latest reservations from backend
    (async () => {
      try {
        await fetchReservations();
      } catch (err) {
        toast.error("Failed to load reservations");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setBookings([]);
      return;
    }
    const userBookings = getUserReservationsByEmail(userEmail);
    setBookings(userBookings);
  }, [reservations, userEmail, getUserReservationsByEmail]);

  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const uniqueMovies = new Set(bookings.map(b => b.movie?.title)).size;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : "!"}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-4">
              <div className="bg-accent/20 p-3 rounded-lg">
                <Ticket className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Movies Watched</p>
                <p className="text-2xl font-bold text-foreground">{uniqueMovies}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">₹{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="p-6 bg-card/50 border-border/50 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
            <Button variant="cinema" onClick={() => navigate("/")}>
              Book More Tickets
            </Button>
          </div>

          {bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Booking Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.movie?.title}</TableCell>
                    <TableCell>{b.movie?.genre}</TableCell>
                    <TableCell>{b.seats}</TableCell>
                    <TableCell>₹{b.totalPrice}</TableCell>
                    <TableCell>{new Date(b.bookingTime).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-4">No bookings yet</p>
              <Button variant="cinema" onClick={() => navigate("/")}>
                Browse Movies
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;