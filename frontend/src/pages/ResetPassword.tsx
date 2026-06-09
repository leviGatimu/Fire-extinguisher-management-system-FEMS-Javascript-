import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/auth/reset-password', { token, password });
    toast.success('Password reset. Please sign in.');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="mb-1 text-2xl font-bold">Reset password</h1>
          <p className="mb-6 text-sm text-muted-foreground">Choose a new password.</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Reset token</Label><Input value={token} onChange={(e) => setToken(e.target.value)} required /></div>
            <div className="space-y-2"><Label>New password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Reset password</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
