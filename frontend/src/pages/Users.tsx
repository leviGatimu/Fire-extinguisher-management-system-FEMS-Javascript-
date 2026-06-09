import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import {
  Button, Input, Select, Card, CardContent, Table, THead, TBody, TR, TH, TD, Badge, TableSkeleton, EmptyState, Label,
} from '@/components/ui';

export default function Users() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' });

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users', { params: { limit: 50 } }).then((r) => r.data) });

  const create = useMutation({
    mutationFn: () => api.post('/users', form),
    onSuccess: () => { toast.success('User created'); setShowForm(false); setForm({ firstName: '', lastName: '', email: '', password: '', role: 'USER' }); qc.invalidateQueries({ queryKey: ['users'] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  return (
    <>
      <PageHeader title="Users Management" subtitle="Manage accounts and roles"
        action={<Button onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" /> Add User</Button>} />

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>First name</Label><Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Last name</Label><Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-2"><Label>Role</Label><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="USER">User</option><option value="INSPECTOR">Inspector</option><option value="ADMIN">Admin</option></Select></div>
            <div className="flex items-end"><Button type="submit" disabled={create.isPending}>Create user</Button></div>
          </form>
        </CardContent></Card>
      )}

      <Card>
        {isLoading ? <TableSkeleton /> : data?.data.length === 0 ? <EmptyState title="No users" /> : (
          <Table>
            <THead><TR><TH>Name</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
            <TBody>
              {data?.data.map((u: any) => (
                <TR key={u.id}>
                  <TD className="font-medium">{u.firstName} {u.lastName}</TD>
                  <TD className="text-muted-foreground">{u.email}</TD>
                  <TD><Badge className="bg-secondary text-secondary-foreground">{u.role.name}</Badge></TD>
                  <TD><Badge className={u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}>{u.isActive ? 'Active' : 'Disabled'}</Badge></TD>
                  <TD className="text-right"><Button variant="ghost" size="icon" onClick={() => confirm(`Delete ${u.email}?`) && remove.mutate(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
