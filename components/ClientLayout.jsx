"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { canAccessPath } from "../lib/permissions";

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [companyLogo, setCompanyLogo] = useState(null);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check for custom company logo
    const savedLogo = localStorage.getItem("companyLogo");
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }

    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000">
        <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo de l'entreprise" className="h-32 object-contain animate-pulse" />
          ) : (
            <div className="flex flex-col items-center animate-pulse">
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Cygne<span className="text-primary">Gestion</span></h1>
              <div className="mt-6 flex items-center gap-3">
                 <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                 <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Chargement...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (pathname === "/login") {
    return <div className="min-h-screen bg-surface animate-in fade-in duration-500">{children}</div>;
  }

  // Évite l'affichage du contenu le temps de la redirection
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-700">
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
