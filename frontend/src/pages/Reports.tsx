import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { api, tokenStore } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { labelize } from '@/lib/utils';

export default function Reports() {
  const summary = useQuery({ queryKey: ['summary'], queryFn: () => api.get('/reports/summary').then((r) => r.data.data) });
  const monthly = useQuery({ queryKey: ['monthly'], queryFn: () => api.get('/reports/monthly').then((r) => r.data.data) });

  const download = async (kind: 'pdf' | 'excel', filename: string) => {
    const res = await api.get(`/reports/export/${kind}`, { responseType: 'blob', headers: { Authorization: `Bearer ${tokenStore.access}` } });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  const cards = summary.data?.cards ?? {};
  return (
    <>
      <PageHeader title="Reports" subtitle="Compliance analytics & exports"
        action={<div className="flex gap-2">
          <Button variant="outline" onClick={() => download('pdf', 'fems-report.pdf')}><FileText className="h-4 w-4" /> PDF</Button>
          <Button variant="outline" onClick={() => download('excel', 'fems-inventory.xlsx')}><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
        </div>} />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(cards).map(([k, v]) => (
          <Card key={k}><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{labelize(k)}</p><p className="mt-1 text-2xl font-bold">{v as number}</p></CardContent></Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Inspections completed over {monthly.data?.year}</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly.data?.months}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="inspections" stroke="#f59e0b" strokeWidth={2} name="Scheduled" />
              <Line type="monotone" dataKey="maintenance" stroke="#3b82f6" strokeWidth={2} name="Maintenance" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
