import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Film } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/user');
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && !name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password, role);
        if (success) {
          toast.success('Login successful!');
        } else {
          toast.error('Invalid credentials. Please try again.');
        }
      } else {
        const success = await register(email, password, name, role);
        if (success) {
          toast.success('Registration successful!');
        } else {
          toast.error('Email already exists. Please login instead.');
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10" />
      
      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-sm shadow-cinema border-border/50">
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gradient-primary p-3 rounded-lg shadow-cinema">
              <Film className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CineHub
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin ? 'Welcome back!' : 'Join us today!'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-background/50"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={(value: 'user' | 'admin') => setRole(value)}>
                <SelectTrigger id="role" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              variant="cinema" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-accent font-semibold">
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
