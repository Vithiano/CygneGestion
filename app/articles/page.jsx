"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, PackageOpen, Download, Trash2 } from "lucide-react";
import AdminAuthModal from "@/components/AdminAuthModal";

const initialArticles = [
  { id: "ART-001", name: "Ciment CPJ 42.5", category: "Construction", measure: "Tonne", price: "85,000 F CFA", stock: "120 t" },
  { id: "ART-002", name: "Fer à béton 10mm", category: "Construction", measure: "Botte", price: "45,000 F CFA", stock: "50 Bottes" },
  { id: "ART-003", name: "Blé Tendre", category: "Agroalimentaire", measure: "Tonne", price: "210,000 F CFA", stock: "500 t" },
  { id: "ART-004", name: "Riz Parfumé", category: "Agroalimentaire", measure: "Tonne", price: "450,000 F CFA", stock: "80 t" },
];

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (article) => {
    setItemToDelete(article);
    setAuthModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setArticles(articles.filter(a => a.id !== itemToDelete.id));
      setAuthModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? article.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Catalogue des Articles</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gérez votre base de données de produits et d'articles disponibles pour les bons d'entrée.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
            <Download className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Exporter
          </button>
          <button 
            onClick={() => router.push('/articles/new')}
            className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Nouvel Article
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
              placeholder="Rechercher par nom ou référence..."
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full sm:w-48 rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          >
            <option value="">Toutes les catégories</option>
            <option value="Construction">Construction</option>
            <option value="Agroalimentaire">Agroalimentaire</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Référence</th>
                <th scope="col" className="px-6 py-4 font-semibold">Article</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Catégorie</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Unité de mesure</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Prix Unitaire indicatif</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-primary transition-colors">{article.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <PackageOpen className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-gray-900">{article.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">{article.measure}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{article.price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => router.push(`/articles/${article.id}`)}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(article)}
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
                    Aucun article trouvé.
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
        itemName={itemToDelete ? `l'article ${itemToDelete.name}` : ""}
      />
    </div>
  );
}
