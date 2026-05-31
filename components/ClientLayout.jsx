"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { canAccessPath } from "../lib/permissions";

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/login") return;

    const savedUser = localStorage.getItem("currentUser");
    if (!savedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(savedUser);
    
    if (!canAccessPath(user.role, pathname)) {
      router.push("/");
      return;
    }

    setIsAuthenticated(true);
  }, [pathname, router]);

  if (pathname === "/login") {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  // Évite l'affichage du contenu le temps de la redirection
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 print:pl-0 flex flex-col min-h-screen">
        <div className="print:hidden">
          <Header setIsOpen={setSidebarOpen} />
        </div>
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
