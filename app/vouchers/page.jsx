"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, Download, ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react";
import AdminAuthModal from "@/components/AdminAuthModal";

const initialVouchers = [
  { id: "BON-2024-001", client: "Entreprise Alpha", date: "2024-05-20", mesure: "15 t", amount: "150,000 F CFA", status: "Validé" },
  { id: "BON-2024-002", client: "Société Beta", date: "2024-05-19", mesure: "34 t", amount: "340,000 F CFA", status: "En attente" },
  { id: "BON-2024-003", client: "Garage du Centre", date: "2024-05-18", mesure: "8.5 t", amount: "85,000 F CFA", status: "Validé" },
  { id: "BON-2024-004", client: "Pharmacie Sante", date: "2024-05-18", mesure: "21 t", amount: "210,000 F CFA", status: "Rejeté" },
  { id: "BON-2024-005", client: "Agro Industrie", date: "2024-05-17", mesure: "50 t", amount: "500,000 F CFA", status: "Validé" },
  { id: "BON-2024-006", client: "Boulangerie Moderne", date: "2024-05-16", mesure: "12 t", amount: "120,000 F CFA", status: "En attente" },
  { id: "BON-2024-007", client: "Supermarché Express", date: "2024-05-15", mesure: "45 t", amount: "450,000 F CFA", status: "Validé" },
  { id: "BON-2024-008", client: "Quincaillerie Pro", date: "2024-05-15", mesure: "5 t", amount: "50,000 F CFA", status: "Validé" },
  { id: "BON-2024-009", client: "Transports Rapides", date: "2024-05-14", mesure: "28 t", amount: "280,000 F CFA", status: "Validé" },
  { id: "BON-2024-010", client: "Bâtiment & Co", date: "2024-05-14", mesure: "110 t", amount: "1,100,000 F CFA", status: "En attente" },
  { id: "BON-2024-011", client: "Menuiserie Plus", date: "2024-05-13", mesure: "3 t", amount: "30,000 F CFA", status: "Validé" },
  { id: "BON-2024-012", client: "Fermes Unies", date: "2024-05-12", mesure: "18 t", amount: "180,000 F CFA", status: "Rejeté" },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export default function VouchersPage() {
  const router = useRouter();
  const [allVouchers, setAllVouchers] = useState(initialVouchers);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const updateStatus = (id, newStatus) => {
    setAllVouchers(allVouchers.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  const handleDeleteClick = (e, voucher) => {
    e.stopPropagation();
    setItemToDelete(voucher);
    setAuthModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setAllVouchers(allVouchers.filter(v => v.id !== itemToDelete.id));
      setAuthModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredVouchers = allVouchers.filter((voucher) => {
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bons d'entrée</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gérez tous vos bons d'entrée. Vous pouvez les filtrer, les rechercher ou en créer de nouveaux.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
            <Download className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Exporter
          </button>
          <button 
            onClick={() => router.push('/bons/new')}
            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Nouveau Bon
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-surface shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 ml-3 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un bon, un client..."
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-40 rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            >
              <option value="">Tous les statuts</option>
              <option value="Validé">Validé</option>
              <option value="En attente">En attente</option>
              <option value="Rejeté">Rejeté</option>
            </select>

            <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50/50 p-1 rounded-md ring-1 ring-inset ring-gray-300">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full sm:w-auto rounded bg-transparent border-0 py-1 px-2 text-gray-900 focus:ring-2 focus:ring-primary sm:text-sm"
              />
              <span className="text-gray-400 text-sm">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full sm:w-auto rounded bg-transparent border-0 py-1 px-2 text-gray-900 focus:ring-2 focus:ring-primary sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                    Référence
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">Client</th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Unité de mesure</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Montant</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Statut</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentVouchers.length > 0 ? (
                currentVouchers.map((voucher) => (
                  <tr 
                    key={voucher.id} 
                    onClick={() => router.push(`/bons/${voucher.id}`)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-primary transition-colors">{voucher.id}</td>
                    <td className="px-6 py-4 text-gray-600">{voucher.client}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(voucher.date)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{voucher.mesure}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{voucher.amount}</td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                          ${voucher.status === 'Validé' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : ''}
                          ${voucher.status === 'En attente' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20' : ''}
                          ${voucher.status === 'Rejeté' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' : ''}
                        `}>
                          {voucher.status}
                        </span>
                        <div className="relative group/select">
                          <select 
                            value={voucher.status}
                            onChange={(e) => updateStatus(voucher.id, e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          >
                            <option value="Validé">Validé</option>
                            <option value="En attente">En attente</option>
                            <option value="Rejeté">Rejeté</option>
                          </select>
                          <button className="text-gray-400 group-hover/select:text-gray-600 p-1 rounded-full group-hover/select:bg-gray-100 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(`/bons/${voucher.id}`); }}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, voucher)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Aucun bon d'entrée ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {filteredVouchers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-gray-50/30 px-6 py-4 gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <span>Lignes par page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 block rounded-md border-gray-300 py-1 pl-2 pr-8 text-gray-900 focus:ring-primary sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500">
                Affichage de <span className="font-medium text-gray-900">{(validCurrentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium text-gray-900">{Math.min(validCurrentPage * itemsPerPage, filteredVouchers.length)}</span> sur <span className="font-medium text-gray-900">{filteredVouchers.length}</span> résultats
              </p>
            </div>

            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={validCurrentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Précédent</span>
                  &larr;
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${validCurrentPage === index + 1 ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 transition-colors'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={validCurrentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Suivant</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      <AdminAuthModal 
        isOpen={authModalOpen} 
        onClose={() => { setAuthModalOpen(false); setItemToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? `le bon ${itemToDelete.id}` : ""}
      />
    </div>
  );
}
