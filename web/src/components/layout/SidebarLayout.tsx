import * as React from "react"
import { LayoutDashboard, Building2, Briefcase, Search, Settings, Rocket } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"

const navigation = {
    main: [
        { name: "Discovery", icon: Search, href: "#" },
        { name: "Companies", icon: Building2, href: "#" },
        { name: "Jobs", icon: Briefcase, href: "#" },
    ],
    system: [
        { name: "Dashboard", icon: LayoutDashboard, href: "#" },
        { name: "Settings", icon: Settings, href: "#" },
    ],
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <Sidebar className="border-r border-border/40">
                    <SidebarHeader className="p-4">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                <Rocket className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                GrowthUI
                            </span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-slate-500 font-medium">Platform</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigation.main.map((item) => (
                                        <SidebarMenuItem key={item.name}>
                                            <SidebarMenuButton asChild tooltip={item.name} className="hover:bg-slate-800/50">
                                                <a href={item.href} className="flex items-center gap-3">
                                                    <item.icon className="h-5 w-5" />
                                                    <span>{item.name}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-slate-500 font-medium">Admin</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigation.system.map((item) => (
                                        <SidebarMenuItem key={item.name}>
                                            <SidebarMenuButton asChild tooltip={item.name} className="hover:bg-slate-800/50">
                                                <a href={item.href} className="flex items-center gap-3">
                                                    <item.icon className="h-5 w-5" />
                                                    <span>{item.name}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="p-4 border-t border-border/40">
                        <div className="flex items-center gap-3 py-2">
                            <div className="h-8 w-8 rounded-full bg-slate-800" />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white">Gaurav Kotak</span>
                                <span className="text-[10px] text-slate-500">Free Tier</span>
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1 flex flex-col">
                    <div className="flex h-16 items-center border-b border-border/40 px-6 shrink-0">
                        <SidebarTrigger />
                        <div className="ml-auto flex items-center gap-4">
                            <span className="text-xs text-slate-500">Live Status: Supabase Connected</span>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
