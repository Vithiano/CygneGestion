"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, UserPlus, Mail, Trash2 } from "lucide-react";
import AdminAuthModal from "@/components/AdminAuthModal";

const initialUsers = [
  { id: "USR-001", name: "Lionel VITHIANO", email: "lionel@cygnegastion.ci", role: "Administrateur", status: "Actif", lastLogin: "Aujourd'hui à 08:30" },
  { id: "USR-002", name: "Marc Dupont", email: "m.dupont@cygnegastion.ci", role: "Opérateur", status: "Actif", lastLogin: "Hier à 14:15" },
  { id: "USR-003", name: "Awa Koné", email: "a.kone@cygnegastion.ci", role: "Manager", status: "Actif", lastLogin: "Aujourd'hui à 09:12" },
  { id: "USR-004", name: "Jean Touré", email: "j.toure@cygnegastion.ci", role: "Opérateur", status: "Inactif", lastLogin: "Il y a 2 semaines" },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (user) => {
    setItemToDelete(user);
    setAuthModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setUsers(users.filter(u => u.id !== itemToDelete.id));
      setAuthModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Utilisateurs & Accès</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gérez les accès à votre plateforme. Définissez qui peut voir, créer ou modifier des éléments.
          </p>
        </div>
        <div>
          <button 
            onClick={() => router.push('/users/new')}
            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Ajouter un utilisateur
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
              placeholder="Rechercher un utilisateur..."
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full sm:w-48 rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          >
            <option value="">Tous les rôles</option>
            <option value="Administrateur">Administrateur</option>
            <option value="Manager">Manager</option>
            <option value="Opérateur">Opérateur</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Utilisateur</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Rôle</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Dernière connexion</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Statut</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-gray-500 flex items-center gap-1 text-xs mt-0.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 ring-1 ring-inset ring-gray-500/10">
                        <Shield className="h-3 w-3 text-gray-400" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                        ${user.status === 'Actif' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20'}
                      `}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => router.push(`/users/${user.id}`)}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
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
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé.
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
        itemName={itemToDelete ? `l'utilisateur ${itemToDelete.name}` : ""}
      />
    </div>
  );
}
