"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { Bus, LayoutDashboard, Route, MapPin, Ticket, Users, LogOut } from 'lucide-react';

const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { href: "/admin/routes", label: "Manage Routes", icon: <Route /> },
    { href: "/admin/locations", label: "Manage Locations", icon: <MapPin /> },
    { href: "/admin/bookings", label: "View Bookings", icon: <Ticket /> },
    { href: "/admin/conductors", label: "Manage Conductors", icon: <Users /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 p-2">
                        <Bus className="size-8 text-sidebar-primary" />
                        <span className="text-lg font-semibold font-headline">Admin Panel</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {adminNavItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href} legacyBehavior passHref>
                                    <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/" legacyBehavior passHref>
                                <SidebarMenuButton tooltip="Logout">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex-1 bg-background flex flex-col min-h-screen">
                <header className="md:hidden flex items-center justify-between p-2 border-b">
                    <SidebarTrigger />
                    <Link href="/" className="flex items-center gap-2 text-md font-bold font-headline text-primary">
                      <Bus className="h-6 w-6" />
                      HMC Admin
                    </Link>
                </header>
                <SidebarInset className="flex-grow">
                    {children}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
