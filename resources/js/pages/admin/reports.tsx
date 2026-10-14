import { Head } from '@inertiajs/react';
import ActivityReport from '@/components/activity-report';

type Props = {
    summary: {
        totalActivities: number;
        totalRequests: number;
        pendingRequests: number;
        processingRequests: number;
        readyToClaim: number;
        claimedRequests: number;
        totalResidents: number;
    };
    activities: {
        data: Array<{
            id: number;
            event: string;
            description: string;
            created_at: string;
            actor_name: string | null;
            actor_role: string | null;
            actor: { name: string; role: string } | null;
        }>;
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

export default function ReportsPage({ summary, activities }: Props) {
    return (
        <>
            <Head title="Activity" />
            <ActivityReport
                roleLabel="Super Admin"
                backHref="/admin/dashboard"
                summary={summary}
                activities={activities}
            />
        </>
    );
}
