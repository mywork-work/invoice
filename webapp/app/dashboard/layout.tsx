"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Loader2 } from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains("w-16"));
      }
    };

    const observer = new MutationObserver(handleResize);
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    }

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
