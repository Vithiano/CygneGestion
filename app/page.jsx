"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, FileText, Users, DollarSign, Search, Filter } from "lucide-react";
import { supabase } from "../lib/supabase";

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export default function Dashboard() {
  const router = useRouter();
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [stats, setStats] = useState([
    { name: "Total des Bons", value: "0", change: "", changeType: "neutral", icon: FileText },
    { name: "Nouveaux Clients", value: "0", change: "", changeType: "neutral", icon: Users },
    { name: "Revenus Estimés", value: "0 F CFA", change: "", changeType: "neutral", icon: DollarSign },
  ]);

  const filteredVouchers = recentVouchers.filter((voucher) => {
    const matchesSearch = voucher.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          voucher.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let afterStart = true;
    let beforeEnd = true;
    let matchesStatus = true;
    
    if (startDate) {
      afterStart = voucher.date >= startDate;
    }
    if (endDate) {
      beforeEnd = voucher.date <= endDate;
    }
    if (statusFilter) {
      matchesStatus = voucher.status === statusFilter;
    }
    
    return matchesSearch && afterStart && beforeEnd && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const currentVouchers = filteredVouchers.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  useEffect(() => {
    async function fetchVouchers() {
      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          id,
          reference,
          date,
          status,
          total_qty,
          total_amount,
          clients (name)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const formatted = data.map(v => ({
          dbId: v.id,
          id: v.reference,
          client: v.clients?.name || 'Inconnu',
          date: v.date,
          mesure: v.total_qty,
          amount: new Intl.NumberFormat('fr-FR').format(v.total_amount) + ' FCFA',
          status: v.status
        }));
        setRecentVouchers(formatted);
      }

      // Calcul des statistiques
      const { count: vouchersCount } = await supabase.from('vouchers').select('*', { count: 'exact', head: true });
      const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { data: vouchersForRev } = await supabase.from('vouchers').select('total_amount');
      
      const totalRevenue = vouchersForRev ? vouchersForRev.reduce((sum, v) => sum + (Number(v.total_amount) || 0), 0) : 0;

      setStats([
        { name: "Total des Bons", value: vouchersCount ? vouchersCount.toString() : "0", change: "", changeType: "neutral", icon: FileText },
        { name: "Nouveaux Clients", value: clientsCount ? clientsCount.toString() : "0", change: "", changeType: "neutral", icon: Users },
        { name: "Revenus Estimés", value: new Intl.NumberFormat('fr-FR').format(totalRevenue) + " F CFA", change: "", changeType: "neutral", icon: DollarSign },
      ]);
    }
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tableau de Bord</h1>
        <p className="mt-2 text-sm text-gray-500">
          Bienvenue, voici un aperçu de vos activités de bons d'entrée.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-surface p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-primary/20 group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-x-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-x-2 text-sm">
              <span className={`inline-flex items-center gap-x-1 font-medium ${stat.changeType === 'positive' ? 'text-secondary' : 'text-red-600'}`}>
                <ArrowUpRight className="h-4 w-4" />
                {stat.change}
              </span>
              <span className="text-gray-400">depuis le mois dernier</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Vouchers List */}
      <div className="rounded-2xl bg-surface shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Bons d'entrée récents</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 ml-2.5 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="block w-full sm:w-56 rounded-md border-0 py-1.5 pl-8 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="">Tous les statuts</option>
              <option value="Validé">Validé</option>
              <option value="En attente">En attente</option>
              <option value="Rejeté">Rejeté</option>
            </select>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
              <span className="text-gray-500 text-sm">à</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Référence</th>
                <th scope="col" className="px-6 py-4 font-medium">Client</th>
                <th scope="col" className="px-6 py-4 font-medium">Date</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Unité de mesure</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Montant</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentVouchers.map((voucher) => (
                <tr 
                  key={voucher.dbId} 
                  onClick={() => router.push(`/bons/${voucher.dbId}`)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{voucher.id}</td>
                  <td className="px-6 py-4 text-gray-500">{voucher.client}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(voucher.date)}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{voucher.mesure}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{voucher.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                      ${voucher.status === 'Validé' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : ''}
                      ${voucher.status === 'En attente' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20' : ''}
                      ${voucher.status === 'Rejeté' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' : ''}
                    `}>
                      {voucher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-white px-6 py-3 gap-4">
          <div className="flex items-center text-sm text-gray-500 w-full sm:w-auto justify-center sm:justify-start">
            <span>Lignes par page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 block rounded-md border-0 py-1 pl-2 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex flex-1 justify-between sm:hidden w-full">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validCurrentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Affichage de <span className="font-medium text-gray-900">{filteredVouchers.length > 0 ? (validCurrentPage - 1) * itemsPerPage + 1 : 0}</span> à <span className="font-medium text-gray-900">{Math.min(validCurrentPage * itemsPerPage, filteredVouchers.length)}</span> sur <span className="font-medium text-gray-900">{filteredVouchers.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={validCurrentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${validCurrentPage === index + 1 ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={validCurrentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
