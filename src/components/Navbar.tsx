import { Film, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-primary p-2 rounded-lg shadow-cinema group-hover:shadow-xl transition-all">
              <Film className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CineHub
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/user')}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  {user?.name}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth?mode=login')}>
                  Login
                </Button>
                <Button variant="cinema" onClick={() => navigate('/auth?mode=register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
