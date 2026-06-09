import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/Layout';
import { Pagination } from '@/components/Pagination';
import { formatDate, labelize } from '@/lib/utils';
import {
  Button, Input, Select, Card, Table, THead, TBody, TR, TH, TD, StatusBadge, TableSkeleton, EmptyState,
} from '@/components/ui';

const STATUSES = ['ACTIVE', 'DUE_FOR_INSPECTION', 'EXPIRED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];
const TYPES = ['WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL'];

export default function Extinguishers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['extinguishers', { page, search, status, type }],
    queryFn: () => api.get('/extinguishers', { params: { page, limit: 10, search: search || undefined, status: status || undefined, type: type || undefined } }).then((r) => r.data),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/extinguishers/${id}`),
    onSuccess: () => { toast.success('Extinguisher deleted'); qc.invalidateQueries({ queryKey: ['extinguishers'] }); },
  });

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <PageHeader title="Fire Extinguishers" subtitle="Inventory across all facilities"
        action={isAdmin && <Button onClick={() => navigate('/extinguishers/new')}><Plus className="h-4 w-4" /> Add Extinguisher</Button>} />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search serial or location…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-48">
            <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}
          </Select>
          <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-40">
            <option value="">All types</option>{TYPES.map((t) => <option key={t} value={t}>{labelize(t)}</option>)}
          </Select>
        </div>

        {isLoading ? <TableSkeleton cols={6} /> : data?.data.length === 0 ? (
          <EmptyState title="No extinguishers found" hint="Try adjusting filters or add a new one." />
        ) : (
          <>
            <Table>
              <THead><TR><TH>Serial</TH><TH>Location</TH><TH>Type</TH><TH>Size</TH><TH>Status</TH><TH>Expiry</TH>{isAdmin && <TH className="text-right">Actions</TH>}</TR></THead>
              <TBody>
                {data?.data.map((e: any) => (
                  <TR key={e.id}>
                    <TD className="font-medium">{e.serialNumber}</TD>
                    <TD className="text-muted-foreground">{e.location}</TD>
                    <TD>{labelize(e.type)}</TD>
                    <TD>{labelize(e.size)} lbs</TD>
                    <TD><StatusBadge status={e.status} /></TD>
                    <TD>{formatDate(e.expiryDate)}</TD>
                    {isAdmin && (
                      <TD className="text-right">
                        <Link to={`/extinguishers/${e.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                        <Button variant="ghost" size="icon" onClick={() => confirm(`Delete ${e.serialNumber}?`) && remove.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TD>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
