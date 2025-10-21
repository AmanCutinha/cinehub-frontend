import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovies } from "@/contexts/MovieContext";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Calendar, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/services/bookingService";

const Booking = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { movies } = useMovies();

  const [selectedSeats, setSelectedSeats] = useState(1);
  const [pricePerSeat] = useState(250); // static for now
  const [availableSeats] = useState(50); // mock until backend connects

  const movie = movies.find((m) => m.id === Number(movieId));

  useEffect(() => {
    if (!movie) {
      toast.error("Movie not found!");
    }
  }, [movie]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Movie not found.</p>
          <Button variant="cinema" onClick={() => navigate("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = selectedSeats * pricePerSeat;
  const maxSeats = Math.min(availableSeats, 10);

  const handleIncrement = () => {
    if (selectedSeats < maxSeats) setSelectedSeats(selectedSeats + 1);
  };

  const handleDecrement = () => {
    if (selectedSeats > 1) setSelectedSeats(selectedSeats - 1);
  };

  const handleBooking = async () => {
  try {
    const bookingData = {
      movieId: movie.id,
      userEmail: "aman@example.com", // temporary placeholder (later from auth)
      seats: selectedSeats,
      totalPrice: totalPrice,
    };

    const response = await createBooking(bookingData);
    toast.success(`🎟️ Booking confirmed for ${movie.title}!`);
    console.log("Booking saved:", response);

    navigate("/user");
  } catch (error) {
    toast.error("Failed to create booking. Try again.");
    console.error(error);
  }
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          ← Back to Movies
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden bg-card border-border/50 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="aspect-[2/3] overflow-hidden rounded-lg">
                  <img
                    src={
                      movie.posterUrl ||
                      "https://via.placeholder.com/400x600?text=No+Poster"
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {movie.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="text-accent font-medium">
                      {movie.genre || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {movie.durationMinutes || "N/A"} min
                    </span>
                    <span className="flex items-center gap-1">
                      ⭐ {movie.rating || "N/A"}/10
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {movie.description || "No description available."}
                  </p>

                  <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-foreground">Showtime</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        Today
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        18:30
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Seat Selection */}
            <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Select Seats
              </h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-4 block">Number of Seats</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDecrement}
                      disabled={selectedSeats <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <div className="bg-muted/20 px-8 py-3 rounded-lg">
                      <span className="text-3xl font-bold text-foreground">
                        {selectedSeats}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleIncrement}
                      disabled={selectedSeats >= maxSeats}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Maximum {maxSeats} seats can be selected
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-card border-border/50 shadow-lg sticky top-20">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Booking Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Price per seat</span>
                  <span className="font-semibold">₹{pricePerSeat}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Number of seats</span>
                  <span className="font-semibold">{selectedSeats}</span>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">
                      Total
                    </span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-secondary" />
                      <span className="text-2xl font-bold text-foreground">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="cinema"
                size="lg"
                className="w-full"
                onClick={handleBooking}
              >
                Confirm Booking
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
