"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Download, ArrowUpDown, UserPlus, Trash2, MoreVertical } from "lucide-react";
import AdminAuthModal from "@/components/AdminAuthModal";
import { supabase } from "../../lib/supabase";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);

  const handleUpdateStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Actif' ? 'Inactif' : 'Actif';
    
    // Mettre à jour l'UI immédiatement (Optimistic update)
    setCustomers(customers.map(c => c.dbId === id ? { ...c, status: newStatus } : c));
    setOpenStatusMenu(null);

    // Mettre à jour la base de données
    const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Erreur lors de la mise à jour du statut.");
      // Revert in real app
    }
  };

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) {
        setCustomers(data.map(c => ({
          dbId: c.id,
          id: c.client_id,
          name: c.name,
          email: c.email || 'Non renseigné',
          phone: c.phone || 'Non renseigné',
          date: c.created_at,
          status: c.status || 'Actif'
        })));
      }
    }
    fetchCustomers();
  }, []);

  const handleDeleteClick = (e, customer) => {
    e.stopPropagation();
    setItemToDelete(customer);
    setAuthModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await supabase.from('clients').delete().eq('id', itemToDelete.dbId);
      setCustomers(customers.filter(c => c.dbId !== itemToDelete.dbId));
      setAuthModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? customer.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gérez votre base de données clients. Vous pouvez les contacter directement depuis cette interface.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
            <Download className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Exporter
          </button>
          <button 
            onClick={() => router.push('/customers/new')}
            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Nouveau Client
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-surface shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 ml-3 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email ou ID..."
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-40 rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          >
            <option value="">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Client</th>
                <th scope="col" className="px-6 py-4 font-semibold">Contact</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Date d'inscription</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Statut</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.dbId} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">{customer.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{customer.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{customer.email}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">{formatDate(customer.date)}</td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                          ${customer.status === 'Actif' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20'}
                        `}>
                          {customer.status}
                        </span>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusMenu(openStatusMenu === customer.dbId ? null : customer.dbId);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Modifier le statut"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openStatusMenu === customer.dbId && (
                            <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10">
                              <button
                                onClick={(e) => handleUpdateStatus(e, customer.dbId, customer.status)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                {customer.status === 'Actif' ? 'Rendre Inactif' : 'Rendre Actif'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => router.push(`/customers/${customer.dbId}`)}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, customer)}
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
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    Aucun client ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminAuthModal 
        isOpen={authModalOpen} 
        onClose={() => { setAuthModalOpen(false); setItemToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete ? `le client ${itemToDelete.name}` : ""}
      />
    </div>
  );
}
