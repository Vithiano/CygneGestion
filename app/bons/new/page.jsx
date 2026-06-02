"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, FileText, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function NewVoucherPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const [articlesDatabase, setArticlesDatabase] = useState([]);
  const [clientsDatabase, setClientsDatabase] = useState([]);

  // État pour l'utilisateur courant
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    async function fetchData() {
      const { data: articles } = await supabase.from('articles').select('*').eq('status', 'Actif');
      const { data: clients } = await supabase.from('clients').select('*').eq('status', 'Actif');
      if (articles) setArticlesDatabase(articles);
      if (clients) setClientsDatabase(clients);

      // Générer automatiquement la référence
      const currentYear = new Date().getFullYear();
      
      // Chercher le dernier bon pour extraire son numéro
      const { data: lastVoucher } = await supabase
        .from('vouchers')
        .select('reference')
        .ilike('reference', `BON-${currentYear}-%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;
      if (lastVoucher && lastVoucher.reference) {
        const parts = lastVoucher.reference.split('-');
        if (parts.length === 3) {
          const lastNum = parseInt(parts[2], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }
      
      const newReference = `BON-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
      setReference(newReference);
    }
    fetchData();
  }, []);

  // Form states
  const [client, setClient] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientUuid, setClientUuid] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState("");
  
  // Articles lines
  const [lines, setLines] = useState([
    { id: 1, poNumber: "", article: "", measure: "", quantity: 0, unitPrice: 0, total: 0 }
  ]);

  const addLine = () => {
    const newLineId = Date.now();
    setLines([
      ...lines,
      { id: newLineId, poNumber: "", article: "", measure: "", quantity: 0, unitPrice: 0, total: 0 }
    ]);
    setTimeout(() => {
      document.getElementById(`poNumber-${newLineId}`)?.focus();
    }, 50);
  };

  const removeLine = (idToRemove) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== idToRemove));
    }
  };

  const updateLine = (id, field, value) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedLine.total = Number(updatedLine.quantity) * Number(updatedLine.unitPrice);
        }
        return updatedLine;
      }
      return line;
    }));
  };

  const handleOpenSearchModal = (id, query) => {
    setActiveItemIndex(id);
    setSearchQuery(query || "");
    setIsArticleModalOpen(true);
  };

  const handleSelectArticle = (article) => {
    if (activeItemIndex !== null) {
      setLines(prevLines => prevLines.map(line => {
        if (line.id === activeItemIndex) {
          return {
            ...line,
            article: article.name,
            measure: article.measure,
            unitPrice: article.price,
            total: Number(line.quantity) * Number(article.price)
          };
        }
        return line;
      }));
    }
    setIsArticleModalOpen(false);
  };

  const handleOpenClientSearchModal = (query) => {
    setClientSearchQuery(query || "");
    setIsClientModalOpen(true);
  };

  const handleSelectClient = (clientObj) => {
    setClient(clientObj.name);
    setClientId(clientObj.client_id);
    setClientUuid(clientObj.id);
    setIsClientModalOpen(false);
  };

  const calculateGrandTotal = () => {
    return lines.reduce((acc, line) => acc + line.total, 0);
  };

  const calculateTotalQuantity = () => {
    const rawTotalQty = lines.reduce((acc, line) => acc + Number(line.quantity), 0);
    return Number(rawTotalQty.toFixed(3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Récupérer le nom de l'utilisateur courant pour la traçabilité
      const creatorName = currentUser?.name || 'Inconnu';

      // 1. Insert Voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from('vouchers')
        .insert([{
          reference,
          client_id: clientUuid || null,
          date,
          status: 'Brouillon',
          total_qty: calculateTotalQuantity(),
          total_amount: calculateGrandTotal(),
          // Traçabilité : enregistrer le créateur du bon
          created_by: creatorName,
          updated_by: creatorName
        }])
        .select()
        .single();

      if (voucherError) throw voucherError;

      // 2. Insert Voucher Items
      const itemsToInsert = lines.map(line => ({
        voucher_id: voucherData.id,
        po_number: line.poNumber,
        article_name: line.article,
        measure: line.measure,
        quantity: Number(line.quantity),
        unit_price: Number(line.unitPrice),
        total: line.total
      }));

      const { error: itemsError } = await supabase
        .from('voucher_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      router.push("/vouchers");
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert(`Une erreur est survenue lors de l'enregistrement du bon : ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vouchers" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Nouveau Bon d'Entrée</h1>
            <p className="mt-1 text-sm text-gray-500">
              Créez un nouveau bon et ajoutez les articles correspondants.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* En-tête du bon */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
             <FileText className="h-5 w-5 text-primary" />
             <h2 className="text-base font-semibold text-gray-900">Informations du Bon</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <label htmlFor="reference" className="block text-sm font-medium leading-6 text-gray-900">
                Référence <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  readOnly
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 sm:text-sm sm:leading-6 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="client" className="block text-sm font-medium leading-6 text-gray-900">
                Client <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleOpenClientSearchModal(client);
                    }
                  }}
                  required
                  placeholder="Nom du client (Entrée pour chercher)"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
                <button 
                  type="button"
                  onClick={() => handleOpenClientSearchModal(client)}
                  className="inline-flex items-center justify-center rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
                Date du bon <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lignes d'articles */}
        <div className="px-6 py-5 border-y border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Lignes d'articles</h2>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter une ligne
          </button>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="pb-3 font-medium w-1/5">N° Commande</th>
                <th scope="col" className="pb-3 font-medium w-1/4">Article</th>
                <th scope="col" className="pb-3 font-medium w-1/12">Unité</th>
                <th scope="col" className="pb-3 font-medium w-1/6 text-right">Quantité</th>
                <th scope="col" className="pb-3 font-medium w-1/6 text-right">Prix Unitaire</th>
                <th scope="col" className="pb-3 font-medium w-1/6 text-right">Total Ligne</th>
                <th scope="col" className="pb-3 font-medium w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.map((line, index) => (
                <tr key={line.id}>
                  <td className="py-3 pr-2">
                    <input
                      type="text"
                      id={`poNumber-${line.id}`}
                      value={line.poNumber}
                      onChange={(e) => updateLine(line.id, 'poNumber', e.target.value)}
                      placeholder="N° BC..."
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={line.article}
                        onChange={(e) => updateLine(line.id, 'article', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleOpenSearchModal(line.id, line.article);
                          }
                        }}
                        placeholder="Nom article (Entrée pour chercher)"
                        required
                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => handleOpenSearchModal(line.id, line.article)}
                        className="inline-flex items-center justify-center rounded-md bg-gray-50 px-2.5 py-1.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={line.measure}
                      onChange={(e) => updateLine(line.id, 'measure', e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                    >
                      <option value="">Unité...</option>
                      <option value="Tonne">Tonne (t)</option>
                      <option value="Kilogramme">Kilogramme (kg)</option>
                      <option value="Litre">Litre (L)</option>
                      <option value="Botte">Botte</option>
                      <option value="Unité">Unité</option>
                      <option value="Pot">Pot</option>
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-2 px-3 text-right text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-right text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">FCFA</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-semibold text-gray-900 block pt-2">
                      {new Intl.NumberFormat('fr-FR').format(line.total)} FCFA
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-6 text-right font-medium text-gray-500 pr-4" colSpan={3}>Total Général</td>
                <td className="pt-6 text-right font-bold text-gray-900 px-2">{calculateTotalQuantity()} {lines.length > 0 && lines[0].measure ? lines[0].measure + (calculateTotalQuantity() > 1 && !lines[0].measure.endsWith('s') ? 's' : '') : 'unités'}</td>
                <td className="pt-6"></td>
                <td className="pt-6 text-right font-bold text-primary text-lg px-2">
                  {new Intl.NumberFormat('fr-FR').format(calculateGrandTotal())} FCFA
                </td>
                <td className="pt-6"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Valider le Bon d'Entrée
          </button>
        </div>
      </form>

      {/* ARTICLE SEARCH MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsArticleModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Rechercher un article</h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {articlesDatabase.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Aucun article ne correspond à "{searchQuery}".
                </div>
              ) : (
                <ul className="space-y-1">
                  {articlesDatabase
                    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((article) => (
                      <li key={article.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectArticle(article)}
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">{article.name}</div>
                            <div className="text-xs text-gray-500">Unité : {article.measure}</div>
                          </div>
                          <div className="font-semibold text-gray-700">
                            {article.price.toLocaleString()} CFA
                          </div>
                        </button>
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLIENT SEARCH MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsClientModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Rechercher un client</h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Rechercher par nom de client..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {clientsDatabase.filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Aucun client ne correspond à "{clientSearchQuery}".
                </div>
              ) : (
                <ul className="space-y-1">
                  {clientsDatabase
                    .filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                    .map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">{client.name}</div>
                          </div>
                          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {client.client_id}
                          </div>
                        </button>
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
