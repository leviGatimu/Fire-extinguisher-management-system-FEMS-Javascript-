import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api.post('/auth/forgot-password', { email });
    toast.success('If the email exists, a reset link has been sent.');
    // Dev convenience: the API returns the token when SMTP is not configured.
    if (r.data.data?.resetToken) setToken(r.data.data.resetToken);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="mb-1 text-2xl font-bold">Forgot password</h1>
          <p className="mb-6 text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
          {token && (
            <div className="mt-4 rounded-md border bg-muted p-3 text-xs">
              <p className="mb-1 font-medium">Dev token (no SMTP configured):</p>
              <Link to={`/reset-password?token=${token}`} className="break-all text-primary hover:underline">Reset now →</Link>
            </div>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
