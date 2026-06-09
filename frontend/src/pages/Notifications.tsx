import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { Card, CardContent, Button, Badge, EmptyState, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => api.get('/notifications').then((r) => r.data.data) });
  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <>
      <PageHeader title="Notifications" subtitle="Inspection assignments and alerts" />
      {isLoading ? <Skeleton className="h-40" /> : !data?.length ? <EmptyState title="No notifications" hint="You're all caught up." /> : (
        <div className="space-y-3">
          {data.map((n: any) => (
            <Card key={n.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex gap-3">
                  <Bell className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{n.subject} {n.status !== 'READ' && <Badge className="ml-2 bg-primary/10 text-primary">New</Badge>}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
                {n.status !== 'READ' && <Button variant="ghost" size="icon" onClick={() => markRead.mutate(n.id)}><Check className="h-4 w-4" /></Button>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
