"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, Printer, Edit, Download, Trash2, Plus, Search, UserCircle, PenLine } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function BonDetails({ params }) {
  const { id } = params;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [originalVoucher, setOriginalVoucher] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const [articlesDatabase, setArticlesDatabase] = useState([]);
  const [clientsDatabase, setClientsDatabase] = useState([]);

  const [isItemEditorModalOpen, setIsItemEditorModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [tempItem, setTempItem] = useState({
    article: "", measure: "", poNumber: "", qty: 0, price: 0, total: 0
  });

  const [voucher, setVoucher] = useState({
    id: id,
    dbId: "",
    client: "",
    clientId: "",
    clientUuid: "",
    date: new Date().toISOString().split('T')[0],
    status: "",
    items: [],
    totalAmount: 0,
    totalQty: 0,
    // Champs de traçabilité (back-office uniquement)
    createdBy: "",
    updatedBy: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur courant
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Récupérer le logo stocké s'il existe
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }

    // Récupérer les données du profil entreprise sauvegardées
    const savedCompanyData = localStorage.getItem('companyData');
    if (savedCompanyData) {
      setCompanyData(JSON.parse(savedCompanyData));
    }

    async function fetchData() {
      setIsLoading(true);
      setFetchError(null);
      try {
        // Fetch articles and clients for modals
        const { data: articles, error: articlesError } = await supabase.from('articles').select('*').eq('status', 'Actif');
        const { data: clients, error: clientsError } = await supabase.from('clients').select('*').eq('status', 'Actif');
        
        if (articlesError) throw articlesError;
        if (clientsError) throw clientsError;
        
        if (articles) setArticlesDatabase(articles);
        if (clients) setClientsDatabase(clients);

        // Fetch Voucher
        const { data: v, error: voucherError } = await supabase
          .from('vouchers')
          .select('*, clients(name, client_id)')
          .eq('id', id)
          .single();
          
        if (voucherError) throw voucherError;
          
        if (v) {
          const { data: items, error: itemsError } = await supabase
            .from('voucher_items')
            .select('*')
            .eq('voucher_id', v.id);

          if (itemsError) throw itemsError;

          setVoucher({
            id: v.reference,
            dbId: v.id,
            client: v.clients?.name || 'Inconnu',
            clientId: v.clients?.client_id || '',
            clientUuid: v.client_id,
            date: v.date,
            status: v.status,
            items: items ? items.map(item => ({
              article: item.article_name,
              measure: item.measure,
              poNumber: item.po_number || "",
              qty: Number(item.quantity),
              price: Number(item.unit_price),
              total: Number(item.total)
            })) : [],
            totalAmount: Number(v.total_amount),
            totalQty: Number(v.total_qty),
            // Champs de traçabilité récupérés depuis Supabase
            createdBy: v.created_by || 'Non renseigné',
            updatedBy: v.updated_by || 'Non renseigné'
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setFetchError(error.message || "Impossible de se connecter à la base de données. Vérifiez votre connexion ou vos variables d'environnement.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleEditClick = () => {
    setOriginalVoucher(JSON.parse(JSON.stringify(voucher)));
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setVoucher(originalVoucher);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    try {
      // Nom de l'utilisateur qui effectue la modification
      const editorName = currentUser?.name || 'Inconnu';

      // Préparation des articles pour l'envoi JSON
      const itemsPayload = voucher.items.map(line => ({
        po_number: line.poNumber || null,
        article_name: line.article,
        measure: line.measure,
        quantity: line.qty,
        unit_price: line.price,
        total: line.total
      }));

      // Appel de la fonction sécurisée RPC (Transaction Atomique)
      const { error: rpcError } = await supabase.rpc('update_voucher_safely', {
        p_voucher_id: voucher.dbId,
        p_client_id: voucher.clientUuid,
        p_date: voucher.date,
        p_status: voucher.status,
        p_total_qty: voucher.totalQty,
        p_total_amount: voucher.totalAmount,
        p_updated_by: editorName,
        p_items: itemsPayload
      });

      if (rpcError) throw rpcError;

      // Mise à jour locale de l'affichage pour refléter la modification
      setVoucher(prev => ({ ...prev, updatedBy: editorName }));

    } catch (error) {
      console.error("Erreur lors de la mise à jour", error);
      alert("Une erreur est survenue lors de la sauvegarde: " + (error.message || "Erreur inconnue"));
      // En cas d'erreur, on annule visuellement l'édition
      setVoucher(originalVoucher);
    }
  };

  const updateVoucherField = (field, value) => {
    setVoucher({ ...voucher, [field]: value });
  };

  const openItemModal = (index = null) => {
    if (index !== null) {
      setTempItem({ ...voucher.items[index] });
      setEditingItemIndex(index);
    } else {
      setTempItem({ article: "", measure: "", poNumber: "", qty: 0, price: 0, total: 0 });
      setEditingItemIndex(null);
    }
    setIsItemEditorModalOpen(true);
    setTimeout(() => {
      articleInputRef.current?.focus();
    }, 50);
  };

  const closeItemModal = () => {
    setIsItemEditorModalOpen(false);
    setTempItem({ article: "", measure: "", poNumber: "", qty: 0, price: 0, total: 0 });
    setEditingItemIndex(null);
  };

  const handleTempItemChange = (field, value) => {
    setTempItem(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'qty' || field === 'price') {
        updated.total = (Number(updated.qty) || 0) * (Number(updated.price) || 0);
      }
      return updated;
    });
  };

  const articleInputRef = useRef(null);

  const applyItemModal = () => {
    if (!tempItem.article) {
      alert("Veuillez sélectionner un article.");
      return;
    }
    const newItems = [...voucher.items];
    const total = (Number(tempItem.qty) || 0) * (Number(tempItem.price) || 0);
    const itemToSave = { ...tempItem, total };
    
    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = itemToSave;
    } else {
      newItems.push(itemToSave);
    }
    
    updateVoucherWithNewItems(newItems);
    
    // Reset pour le prochain ajout
    setTempItem({ article: "", measure: "", poNumber: "", qty: 0, price: 0, total: 0 });
    setEditingItemIndex(null);

    // Retourner au premier champ (Article)
    setTimeout(() => {
      articleInputRef.current?.focus();
    }, 50);
  };

  const saveItemModal = () => {
    if (!tempItem.article) {
      alert("Veuillez sélectionner un article.");
      return;
    }
    const newItems = [...voucher.items];
    const total = (Number(tempItem.qty) || 0) * (Number(tempItem.price) || 0);
    const itemToSave = { ...tempItem, total };
    
    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = itemToSave;
    } else {
      newItems.push(itemToSave);
    }
    
    updateVoucherWithNewItems(newItems);
    closeItemModal();
  };

  const removeItem = (index) => {
    const newItems = voucher.items.filter((_, i) => i !== index);
    updateVoucherWithNewItems(newItems);
  };

  const updateVoucherWithNewItems = (newItems) => {
    // Utilisation de Number(val.toFixed(3)) pour éviter le problème des nombres flottants en JS (ex: 0.1 + 0.2 = 0.30000000000000004)
    const rawTotalQty = newItems.reduce((acc, item) => acc + item.qty, 0);
    const newTotalQty = Number(rawTotalQty.toFixed(3));
    
    const newTotalAmount = newItems.reduce((acc, item) => acc + item.total, 0);

    setVoucher({
      ...voucher,
      items: newItems,
      totalQty: newTotalQty,
      totalAmount: newTotalAmount
    });
  };

  const handleOpenSearchModal = (query) => {
    setSearchQuery(query || "");
    setIsArticleModalOpen(true);
  };

  const handleSelectArticle = (article) => {
    setTempItem(prev => {
      const updated = {
        ...prev,
        article: article.name,
        measure: article.measure,
        price: article.price
      };
      updated.total = (Number(updated.qty) || 0) * article.price;
      return updated;
    });
    setIsArticleModalOpen(false);
  };

  const handleOpenClientSearchModal = (query) => {
    setClientSearchQuery(query || "");
    setIsClientModalOpen(true);
  };

  const handleSelectClient = (clientObj) => {
    setVoucher({ ...voucher, client: clientObj.name, clientId: clientObj.client_id, clientUuid: clientObj.id });
    setIsClientModalOpen(false);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-document');
      const opt = {
        margin:       0,
        filename:     `bon-entree-${id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto print:m-0 print:space-y-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/vouchers" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Détails du Bon d'entrée</h1>
            <p className="mt-1 text-sm text-gray-500">
              Référence : <span className="font-medium text-gray-900">{id}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handlePrint} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
             <Printer className="-ml-0.5 h-4 w-4" aria-hidden="true" />
             Imprimer
           </button>
           <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50">
             {isGeneratingPDF ? (
                <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></span>
             ) : (
                <Download className="-ml-0.5 h-4 w-4" aria-hidden="true" />
             )}
             PDF
           </button>
        </div>
      </div>

      {/* GRID LAYOUT: Left (Details/Actions) | Right (PDF Preview) */}
      <div className={`grid grid-cols-1 gap-8 items-start print:block print:w-full print:m-0 ${isEditing ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
        
        {/* COLUMN LEFT: Info & Actions */}
        <div className={`space-y-6 print:hidden ${!isEditing ? 'lg:col-span-1' : ''}`}>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <FileText className="h-5 w-5 text-primary" />
                 <h2 className="text-base font-semibold text-gray-900">
                   {isEditing ? "Mode Édition" : "Informations Générales"}
                 </h2>
              </div>
            </div>
            
            <div className="p-6">
              {!isEditing ? (
                <dl className="grid grid-cols-1 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Client</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{voucher.client}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date d'édition</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(voucher.date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut actuel</dt>
                    <dd className="mt-2 text-sm text-gray-900">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                        <CheckCircle className="h-4 w-4" />
                        {voucher.status}
                      </span>
                    </dd>
                  </div>

                  {/* Séparateur de traçabilité — visible uniquement en back-office */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Traçabilité</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-lg ring-1 ring-inset ring-blue-100">
                        <UserCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Créé par</p>
                          <p className="text-sm font-semibold text-gray-800">{voucher.createdBy}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-lg ring-1 ring-inset ring-amber-100">
                        <PenLine className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Dernière modification par</p>
                          <p className="text-sm font-semibold text-gray-800">{voucher.updatedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </dl>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={voucher.client} 
                        onChange={(e) => updateVoucherField('client', e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleOpenClientSearchModal(voucher.client);
                          }
                        }}
                        placeholder="Nom du client (Entrée pour chercher)" 
                        className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300" 
                      />
                      <button 
                        type="button"
                        onClick={() => handleOpenClientSearchModal(voucher.client)}
                        className="inline-flex items-center justify-center rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'édition</label>
                    <input type="date" value={voucher.date} onChange={(e) => updateVoucherField('date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <select value={voucher.status} onChange={(e) => updateVoucherField('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300">
                      <option value="Validé">Validé</option>
                      <option value="En attente">En attente</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Articles</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                      {voucher.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between group">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.article}</p>
                            <p className="text-xs text-gray-500">
                              N° BC: {item.poNumber || "-"} • Qté: {item.qty} {item.measure} • P.U: {item.price.toLocaleString()} CFA
                            </p>
                            <p className="text-sm font-bold text-primary mt-1">{item.total.toLocaleString()} CFA</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => openItemModal(idx)} 
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                              title="Modifier l'article"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => removeItem(idx)} 
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                              title="Retirer l'article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {voucher.items.length === 0 && (
                        <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          Aucun article dans ce bon.
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => openItemModal()}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une ligne
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              {!isEditing ? (
                <button onClick={handleEditClick} className="w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary hover:bg-primary/5 transition-colors">
                  <Edit className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                  Modifier les détails
                </button>
              ) : (
                <>
                  <button onClick={handleCancelClick} className="flex-1 inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleSaveClick} className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors">
                    Sauvegarder
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN RIGHT: PDF Preview */}
        <div className={`overflow-x-auto pb-4 ${!isEditing ? 'lg:col-span-2' : ''}`}>
          {/* A4 Paper Container */}
          <div id="pdf-document" className="bg-white rounded-md shadow-xl border border-gray-200 aspect-[1/1.414] min-w-[700px] w-full max-w-3xl mx-auto overflow-hidden relative print:shadow-none print:border-none print:aspect-auto print:max-w-full print:min-w-0">
            
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-primary"></div>

            <div className="p-12 h-full flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo Entreprise" className="h-12 object-contain" />
                  ) : (
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Cygne<span className="text-primary">Gestion</span></h1>
                  )}
                  <p className="text-sm text-gray-500 mt-2 max-w-xs">
                    {companyData ? (
                      <>
                        {companyData.address && <>{companyData.address}<br /></>}
                        {companyData.phone && <>{companyData.phone}<br /></>}
                        {companyData.email && <>{companyData.email}</>}
                      </>
                    ) : (
                      <>Zone Industrielle, Yopougon<br />Abidjan, Côte d'Ivoire<br />+225 01 02 03 04 05</>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-300 uppercase tracking-widest mb-2">Bon d'Entrée</h2>
                  <p className="text-sm font-bold text-gray-900">Réf : {voucher.id}</p>
                  <p className="text-sm text-gray-500">Date : {formatDate(voucher.date)}</p>
                </div>
              </div>

              {/* Client Info block */}
              <div className="mb-10 p-4 rounded-lg bg-gray-50 border border-gray-100 w-1/2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informations Client</h3>
                <p className="text-base font-bold text-gray-900">{voucher.client}</p>
                <p className="text-sm text-gray-600">ID Client : {voucher.clientId}</p>
              </div>

              {/* Table */}
              <div className="flex-grow">
                <table className="w-full text-left text-xs mb-6">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="pb-1.5 font-bold text-gray-900">Description</th>
                      <th className="pb-1.5 font-bold text-gray-900 text-center">N° BC</th>
                      <th className="pb-1.5 font-bold text-gray-900 text-right">Qté</th>
                      <th className="pb-1.5 font-bold text-gray-900 text-right">P.U (CFA)</th>
                      <th className="pb-1.5 font-bold text-gray-900 text-right">Total (CFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {voucher.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 text-gray-800">
                          <span className="font-medium">{item.article}</span>
                          <span className="block text-[10px] text-gray-500">Unité : {item.measure}</span>
                        </td>
                        <td className="py-1.5 text-gray-600 text-center">{item.poNumber}</td>
                        <td className="py-1.5 text-gray-800 text-right">{item.qty}</td>
                        <td className="py-1.5 text-gray-600 text-right">{item.price.toLocaleString()}</td>
                        <td className="py-1.5 font-medium text-gray-900 text-right">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Signatures */}
              <div className="mt-auto">
                <div className="flex justify-end mb-12">
                  <div className="w-1/2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Quantité totale</span>
                      <span className="font-medium text-gray-900">{Number(voucher.totalQty.toFixed(3))} {voucher.items.length > 0 && voucher.items[0].measure ? voucher.items[0].measure + (voucher.totalQty > 1 && !voucher.items[0].measure.endsWith('s') ? 's' : '') : 'Unités'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b-2 border-gray-900">
                      <span className="font-bold text-gray-900">Montant Global</span>
                      <span className="font-bold text-primary text-lg">{voucher.totalAmount.toLocaleString()} CFA</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-sm text-gray-500">
                  <div className="border-t border-gray-200 pt-4">
                    Visa Réceptionnaire
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    Visa Transporteur / Chauffeur
                  </div>
                </div>
                
                <div className="mt-8 text-center text-xs text-gray-400">
                  <p>Édité par : <span className="font-semibold text-gray-600">{currentUser?.name || "Administrateur"}</span></p>
                  <p className="mt-1 text-[10px]">Document généré automatiquement par CygneGestion.</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* MODALE D'ÉDITION D'ARTICLE */}
      {isItemEditorModalOpen && (
        <div className="fixed inset-0 z-[40] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={closeItemModal}></div>
          
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItemIndex !== null ? "Modifier l'article" : "Ajouter un article"}
              </h3>
              <button onClick={closeItemModal} className="text-gray-400 hover:text-gray-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    ref={articleInputRef}
                    value={tempItem.article} 
                    onChange={(e) => handleTempItemChange('article', e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleOpenSearchModal(tempItem.article);
                      }
                    }}
                    placeholder="Nom de l'article (Entrée pour chercher)" 
                    className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300" 
                  />
                  <button 
                    type="button"
                    onClick={() => handleOpenSearchModal(tempItem.article)}
                    className="inline-flex items-center justify-center rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° de Commande (Optionnel)</label>
                <input 
                  type="text" 
                  value={tempItem.poNumber} 
                  onChange={(e) => handleTempItemChange('poNumber', e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyItemModal();
                    }
                  }}
                  placeholder="PO-12345" 
                  className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select 
                    value={tempItem.measure} 
                    onChange={(e) => handleTempItemChange('measure', e.target.value)} 
                    className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Tonne">Tonne (t)</option>
                    <option value="Kilogramme">Kilogramme (kg)</option>
                    <option value="Litre">Litre (L)</option>
                    <option value="Botte">Botte</option>
                    <option value="Unité">Unité</option>
                    <option value="Pot">Pot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={tempItem.price} 
                      onChange={(e) => handleTempItemChange('price', parseFloat(e.target.value) || 0)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyItemModal();
                        }
                      }}
                      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300 text-right" 
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">CFA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input 
                  type="number" 
                  min="0" 
                  step="any"
                  value={tempItem.qty} 
                  onChange={(e) => handleTempItemChange('qty', parseFloat(e.target.value) || 0)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyItemModal();
                    }
                  }}
                  className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ring-1 ring-inset ring-gray-300 text-right" 
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total de la ligne</span>
                <span className="text-lg font-bold text-primary">{tempItem.total.toLocaleString()} CFA</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={closeItemModal} 
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="button" 
                onClick={applyItemModal} 
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary hover:bg-blue-50 transition-colors"
              >
                Appliquer
              </button>
              <button 
                type="button" 
                onClick={saveItemModal} 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE SEARCH MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
