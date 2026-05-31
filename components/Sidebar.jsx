"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, UserCircle, X, Package } from "lucide-react";
import { canAccessPath } from "../lib/permissions";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Bons d'Entrée", href: "/vouchers", icon: FileText },
  { name: "Articles", href: "/articles", icon: Package },
  { name: "Clients", href: "/customers", icon: Users },
  { name: "Utilisateurs", href: "/users", icon: UserCircle },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserRole(user.role);
    }
  }, []);

  const filteredNavigation = navigation.filter(item => canAccessPath(userRole, item.href));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`print:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-primary">CygneGestion</span>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col px-4 py-6">
          <ul role="list" className="flex flex-1 flex-col gap-y-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium leading-6 transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-muted hover:bg-gray-50 hover:text-text-main"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-text-main"}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
