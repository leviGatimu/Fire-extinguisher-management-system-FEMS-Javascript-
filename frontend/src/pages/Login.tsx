import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlameKindling, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@tzw.com');
  const [password, setPassword] = useState('Admin@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await login(email, password); navigate('/'); }
    catch { setError('Invalid email or password'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><FlameKindling className="h-7 w-7" /></div>
          <h1 className="text-2xl font-bold">TZW FEMS</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No account? <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">Demo: admin@tzw.com / Admin@1234</p>
      </div>
    </div>
  );
}
