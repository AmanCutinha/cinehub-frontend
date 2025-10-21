import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMovies } from '@/contexts/MovieContext';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Calendar, Clock, DollarSign } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getUserReservations, movies, showtimes } = useMovies();

  if (!user) {
    navigate('/auth?mode=login');
    return null;
  }

  const userReservations = getUserReservations(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
            <div className="flex items-center gap-4">
              <div className="bg-accent/20 p-3 rounded-lg">
                <Ticket className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{userReservations.length}</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {new Set(userReservations.map(r => r.movieId)).size}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  ${userReservations.reduce((sum, r) => sum + r.totalPrice, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 border-border/50 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">My Reservations</h2>
            <Button variant="cinema" onClick={() => navigate('/')}>
              Book More Tickets
            </Button>
          </div>

          {userReservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie</TableHead>
                  <TableHead>Showtime</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Booking Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.movieTitle}</TableCell>
                    <TableCell>{reservation.showtime}</TableCell>
                    <TableCell>{reservation.seats} seat(s)</TableCell>
                    <TableCell>${reservation.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{new Date(reservation.bookingDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-4">No reservations yet</p>
              <Button variant="cinema" onClick={() => navigate('/')}>
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
