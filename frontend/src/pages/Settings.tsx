import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { PageHeader } from '@/components/Layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences and system information" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div><p className="font-medium">Theme</p><p className="text-sm text-muted-foreground">Currently {theme}</p></div>
            <Button variant="outline" onClick={toggle}>Switch to {theme === 'light' ? 'dark' : 'light'}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {user?.firstName} {user?.lastName}</p>
            <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
            <p><span className="text-muted-foreground">Role:</span> {user?.role}</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>About</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            TZW FEMS v1.0.0 — microservices fire-safety platform. API gateway at <code>:8080</code>, Swagger at <code>/docs</code>.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
