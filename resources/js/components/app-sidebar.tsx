import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    ClipboardCheck,
    ClipboardList,
    FileCheck2,
    FileClock,
    FileText,
    FolderGit2,
    LayoutGrid,
    Settings,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth, unreadNotificationsCount } = usePage().props;
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (auth.user?.role === 'resident') {
        mainNavItems.push(
            { title: 'New request', href: '/resident/request', icon: FileText },
            { title: 'My requests', href: '/resident/requests', icon: ClipboardList },
            {
                title: typeof unreadNotificationsCount === 'number' && unreadNotificationsCount > 0
                    ? `Notifications (${unreadNotificationsCount})`
                    : 'Notifications',
                href: '/resident/notifications',
                icon: Bell,
            },
        );
    }

    if (auth.user?.role === 'secretary') {
        mainNavItems.push(
            { title: 'Process requests', href: '/secretary/requests', icon: FileClock },
            {
                title: 'Processed documents',
                href: '/secretary/processed-documents',
                icon: FileCheck2,
            },
            {
                title: 'Claimed documents',
                href: '/secretary/claimed-documents',
                icon: ClipboardCheck,
            },
        );
    }

    if (auth.user?.role === 'super_admin') {
        mainNavItems.push(
            { title: 'Users', href: '/admin/users', icon: Users },
            { title: 'Staff', href: '/admin/staff', icon: UserCog },
            { title: 'Document Services', href: '/admin/document-types', icon: FileText },
            { title: 'Requests', href: '/admin/requests', icon: ClipboardList },
            { title: 'Activity', href: '/admin/reports', icon: BarChart3 },
            { title: 'Settings', href: '/admin/settings', icon: Settings },
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
