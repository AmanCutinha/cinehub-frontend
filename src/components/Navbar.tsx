import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth?mode=login");
  };

  return (
    <nav className="w-full bg-card/70 backdrop-blur-md border-b border-border/50 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Film className="w-6 h-6 text-accent" />
          <h1 className="font-bold text-lg text-foreground">CineHub</h1>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-foreground hover:text-accent transition">
            Home
          </Link>

          {/* Admin link (only visible to admins) */}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-foreground hover:text-accent transition"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Regular user dashboard link */}
          {isAuthenticated && user?.role !== "admin" && (
            <Link
              to="/user"
              className="text-foreground hover:text-accent transition"
            >
              Dashboard
            </Link>
          )}

          {/* Auth buttons */}
          {!isAuthenticated ? (
            <Button
              variant="cinema"
              size="sm"
              onClick={() => navigate("/auth?mode=login")}
            >
              Login
            </Button>
          ) : (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hi, {user?.name?.split(" ")[0]}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};