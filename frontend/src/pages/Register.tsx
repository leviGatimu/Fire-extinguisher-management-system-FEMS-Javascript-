import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await register(form); navigate('/'); } catch { /* toast handled globally */ } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="mb-1 text-2xl font-bold">Create account</h1>
          <p className="mb-6 text-sm text-muted-foreground">Join the TZW fire-safety platform</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>First name</Label><Input value={form.firstName} onChange={set('firstName')} required /></div>
              <div className="space-y-2"><Label>Last name</Label><Input value={form.lastName} onChange={set('lastName')} required /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={set('password')} required /><p className="text-xs text-muted-foreground">Min 8 chars, with upper, lower & number.</p></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />} Register</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
