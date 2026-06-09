import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { FlameKindling, CheckCircle2, AlertTriangle, CalendarClock, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { labelize } from '@/lib/utils';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'];

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const summary = useQuery({ queryKey: ['summary'], queryFn: () => api.get('/reports/summary').then((r) => r.data.data) });
  const monthly = useQuery({ queryKey: ['monthly'], queryFn: () => api.get('/reports/monthly').then((r) => r.data.data) });

  if (summary.isLoading) {
    return <><PageHeader title="Dashboard" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></>;
  }

  const c = summary.data?.cards ?? {};
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Fire-safety compliance overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Extinguishers" value={c.totalExtinguishers} icon={FlameKindling} tone="bg-primary/10 text-primary" />
        <StatCard label="Active" value={c.active} icon={CheckCircle2} tone="bg-green-100 text-green-600 dark:bg-green-900/40" />
        <StatCard label="Expired" value={c.expired} icon={AlertTriangle} tone="bg-red-100 text-red-600 dark:bg-red-900/40" />
        <StatCard label="Due Inspections" value={c.dueForInspection} icon={CalendarClock} tone="bg-amber-100 text-amber-600 dark:bg-amber-900/40" />
        <StatCard label="Maintenance" value={c.maintenanceActivities} icon={Wrench} tone="bg-blue-100 text-blue-600 dark:bg-blue-900/40" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Extinguishers by Status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.data?.charts.byStatus} dataKey="value" nameKey="label" outerRadius={90} label={(e: any) => labelize(e.label)}>
                  {summary.data?.charts.byStatus.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inspections & Maintenance ({monthly.data?.year})</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.data?.months}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} />
                <Tooltip /><Legend />
                <Bar dataKey="inspections" fill="#f59e0b" name="Scheduled" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" fill="#3b82f6" name="Maintenance" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
