import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/Layout';
import { formatDate } from '@/lib/utils';
import {
  Button, Input, Select, Card, CardContent, Table, THead, TBody, TR, TH, TD, StatusBadge, TableSkeleton, EmptyState, Label,
} from '@/components/ui';

export default function Inspections() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const canManage = user?.role === 'ADMIN' || user?.role === 'INSPECTOR';

  const { data, isLoading } = useQuery({ queryKey: ['inspections'], queryFn: () => api.get('/inspections', { params: { limit: 50 } }).then((r) => r.data) });
  const extinguishers = useQuery({ queryKey: ['ext-options'], queryFn: () => api.get('/extinguishers', { params: { limit: 100 } }).then((r) => r.data.data), enabled: showForm });
  const inspectors = useQuery({ queryKey: ['inspector-options'], queryFn: () => api.get('/users', { params: { role: 'INSPECTOR', limit: 100 } }).then((r) => r.data.data), enabled: showForm && user?.role === 'ADMIN' });

  const [form, setForm] = useState({ extinguisherId: '', inspectorId: '', scheduledAt: '', notes: '' });

  const create = useMutation({
    mutationFn: () => api.post('/inspections', { ...form, inspectorId: form.inspectorId || user!.id }),
    onSuccess: () => { toast.success('Inspection scheduled'); setShowForm(false); setForm({ extinguisherId: '', inspectorId: '', scheduledAt: '', notes: '' }); qc.invalidateQueries({ queryKey: ['inspections'] }); },
  });
  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'complete' | 'cancel' }) => api.patch(`/inspections/${id}/${action}`),
    onSuccess: () => { toast.success('Inspection updated'); qc.invalidateQueries({ queryKey: ['inspections'] }); },
  });

  return (
    <>
      <PageHeader title="Inspection Scheduler" subtitle="Plan and track extinguisher inspections"
        action={canManage && <Button onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" /> Schedule</Button>} />

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Extinguisher</Label>
              <Select required value={form.extinguisherId} onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}>
                <option value="">Select…</option>{extinguishers.data?.map((x: any) => <option key={x.id} value={x.id}>{x.serialNumber} — {x.location}</option>)}
              </Select>
            </div>
            {user?.role === 'ADMIN' && (
              <div className="space-y-2"><Label>Inspector</Label>
                <Select value={form.inspectorId} onChange={(e) => setForm({ ...form, inspectorId: e.target.value })}>
                  <option value="">Assign to me</option>{inspectors.data?.map((i: any) => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                </Select>
              </div>
            )}
            <div className="space-y-2"><Label>Date & time</Label><Input type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button type="submit" disabled={create.isPending}>Schedule inspection</Button>
          </form>
        </CardContent></Card>
      )}

      <Card>
        {isLoading ? <TableSkeleton /> : data?.data.length === 0 ? <EmptyState title="No inspections scheduled" /> : (
          <Table>
            <THead><TR><TH>Extinguisher</TH><TH>Inspector</TH><TH>Scheduled</TH><TH>Status</TH><TH>Notes</TH>{canManage && <TH className="text-right">Actions</TH>}</TR></THead>
            <TBody>
              {data?.data.map((i: any) => (
                <TR key={i.id}>
                  <TD className="font-medium">{i.extinguisher.serialNumber}</TD>
                  <TD>{i.inspector.firstName} {i.inspector.lastName}</TD>
                  <TD>{formatDate(i.scheduledAt)}</TD>
                  <TD><StatusBadge status={i.status} /></TD>
                  <TD className="max-w-[200px] truncate text-muted-foreground">{i.notes ?? '—'}</TD>
                  {canManage && (
                    <TD className="text-right whitespace-nowrap">
                      {['SCHEDULED', 'IN_PROGRESS'].includes(i.status) && (
                        <>
                          <Button variant="ghost" size="icon" title="Complete" onClick={() => act.mutate({ id: i.id, action: 'complete' })}><Check className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="icon" title="Cancel" onClick={() => act.mutate({ id: i.id, action: 'cancel' })}><X className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                    </TD>
                  )}
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
