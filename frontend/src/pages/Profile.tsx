import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function Profile() {
  const { data } = useQuery({ queryKey: ['profile'], queryFn: () => api.get('/users/me/profile').then((r) => r.data.data) });
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => { if (data) setProfile({ firstName: data.firstName, lastName: data.lastName, phone: data.phone ?? '' }); }, [data]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.patch('/users/me/profile', profile);
    toast.success('Profile updated');
  };
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.patch('/users/me/password', pwd);
    toast.success('Password changed — please sign in again on other devices');
    setPwd({ currentPassword: '', newPassword: '' });
  };

  return (
    <>
      <PageHeader title="User Profile" subtitle={data?.email} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2"><Label>First name</Label><Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last name</Label><Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2"><Label>Current password</Label><Input type="password" required value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} /></div>
              <div className="space-y-2"><Label>New password</Label><Input type="password" required value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} /></div>
              <Button type="submit">Update password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
