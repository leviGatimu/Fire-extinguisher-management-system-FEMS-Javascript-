import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { api, tokenStore } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { formatDate } from '@/lib/utils';
import {
  Button, Input, Select, Card, CardContent, Table, THead, TBody, TR, TH, TD, TableSkeleton, EmptyState, Label,
} from '@/components/ui';

export default function Maintenance() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ extinguisherId: '', actionTaken: '', actionDate: '', conditionNotes: '', recommendations: '' });

  const { data, isLoading } = useQuery({ queryKey: ['maintenance'], queryFn: () => api.get('/maintenance', { params: { limit: 50 } }).then((r) => r.data) });
  const extinguishers = useQuery({ queryKey: ['ext-options'], queryFn: () => api.get('/extinguishers', { params: { limit: 100 } }).then((r) => r.data.data), enabled: showForm });

  const create = useMutation({
    mutationFn: () => api.post('/maintenance', form),
    onSuccess: () => { toast.success('Maintenance logged'); setShowForm(false); setForm({ extinguisherId: '', actionTaken: '', actionDate: '', conditionNotes: '', recommendations: '' }); qc.invalidateQueries({ queryKey: ['maintenance'] }); },
  });

  const exportCsv = async () => {
    const res = await api.get('/maintenance/export', { responseType: 'blob', headers: { Authorization: `Bearer ${tokenStore.access}` } });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = 'maintenance-report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Maintenance Logs" subtitle="Service history and condition reports"
        action={<div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button><Button onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" /> Log</Button></div>} />

      {showForm && (
        <Card className="mb-6"><CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Extinguisher</Label>
              <Select required value={form.extinguisherId} onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}>
                <option value="">Select…</option>{extinguishers.data?.map((x: any) => <option key={x.id} value={x.id}>{x.serialNumber} — {x.location}</option>)}
              </Select>
            </div>
            <div className="space-y-2"><Label>Action date</Label><Input type="date" required value={form.actionDate} onChange={(e) => setForm({ ...form, actionDate: e.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Action taken</Label><Input required value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} /></div>
            <div className="space-y-2"><Label>Condition notes</Label><Input value={form.conditionNotes} onChange={(e) => setForm({ ...form, conditionNotes: e.target.value })} /></div>
            <div className="space-y-2"><Label>Recommendations</Label><Input value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} /></div>
            <Button type="submit" disabled={create.isPending}>Save log</Button>
          </form>
        </CardContent></Card>
      )}

      <Card>
        {isLoading ? <TableSkeleton /> : data?.data.length === 0 ? <EmptyState title="No maintenance records yet" /> : (
          <Table>
            <THead><TR><TH>Extinguisher</TH><TH>Action</TH><TH>Date</TH><TH>Inspector</TH><TH>Recommendations</TH></TR></THead>
            <TBody>
              {data?.data.map((m: any) => (
                <TR key={m.id}>
                  <TD className="font-medium">{m.extinguisher.serialNumber}</TD>
                  <TD>{m.actionTaken}</TD>
                  <TD>{formatDate(m.actionDate)}</TD>
                  <TD>{m.inspector.firstName} {m.inspector.lastName}</TD>
                  <TD className="text-muted-foreground">{m.recommendations ?? '—'}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
