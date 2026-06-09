import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { Button, Input, Label, Select, Card, CardContent } from '@/components/ui';
import { labelize } from '@/lib/utils';

const TYPES = ['WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL'];
const SIZES = ['LBS_2_5', 'LBS_5', 'LBS_9', 'LBS_12'];
const STATUSES = ['ACTIVE', 'DUE_FOR_INSPECTION', 'EXPIRED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];

const empty = { serialNumber: '', location: '', type: 'CO2', size: 'LBS_5', installationDate: '', expiryDate: '', status: 'ACTIVE' };

export default function ExtinguisherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ['extinguisher', id], enabled: editing,
    queryFn: () => api.get(`/extinguishers/${id}`).then((r) => r.data.data),
  });

  useEffect(() => {
    if (data) setForm({ ...data, installationDate: data.installationDate.slice(0, 10), expiryDate: data.expiryDate.slice(0, 10) });
  }, [data]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/extinguishers/${id}`, form);
      else await api.post('/extinguishers', form);
      toast.success(`Extinguisher ${editing ? 'updated' : 'created'}`);
      navigate('/extinguishers');
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit Extinguisher' : 'Add Extinguisher'} />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Serial Number</Label><Input value={form.serialNumber} onChange={set('serialNumber')} required /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={set('location')} required /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t} value={t}>{labelize(t)}</option>)}</Select></div>
            <div className="space-y-2"><Label>Size</Label><Select value={form.size} onChange={set('size')}>{SIZES.map((s) => <option key={s} value={s}>{labelize(s)} lbs</option>)}</Select></div>
            <div className="space-y-2"><Label>Installation Date</Label><Input type="date" value={form.installationDate} onChange={set('installationDate')} required /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={set('expiryDate')} required /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Status</Label><Select value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}</Select></div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={saving}>{editing ? 'Save changes' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/extinguishers')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
