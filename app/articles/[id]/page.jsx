"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, PackagePlus, Edit, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function ArticleFormPage({ params }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    category: "",
    measure: "",
    price: "",
    description: ""
  });

  useEffect(() => {
    async function fetchArticle() {
      if (!isNew) {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (data) {
          setFormData({
            name: data.name || "",
            reference: params.id, // Assuming ID is shown as reference, or if there's a reference field
            category: "Standard", // Mock
            measure: data.measure || "",
            price: data.price || "",
            description: ""
          });
        }
      }
    }
    fetchArticle();
  }, [params.id, isNew]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = {
      name: formData.name,
      measure: formData.measure,
      price: Number(formData.price) || 0
    };

    if (isNew) {
      const { error } = await supabase.from('articles').insert([payload]);
      if (error) {
        alert("Erreur lors de la création de l'article : " + error.message);
        setIsLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('articles').update(payload).eq('id', params.id);
      if (error) {
        alert("Erreur lors de la modification de l'article : " + error.message);
        setIsLoading(false);
        return;
      }
    }

    router.refresh();
    window.location.href = "/articles";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/articles" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isNew ? "Nouvel Article" : "Modifier l'Article"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isNew ? "Ajoutez un nouveau produit à votre catalogue." : "Mettez à jour les informations du produit."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
             {isNew ? <PackagePlus className="h-5 w-5 text-primary" /> : <Edit className="h-5 w-5 text-primary" />}
             <h2 className="text-base font-semibold text-gray-900">Informations de l'article</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Nom de l'article <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Ciment CPJ 42.5"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="reference" className="block text-sm font-medium leading-6 text-gray-900">
                Référence / Code <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="reference"
                  id="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  required
                  placeholder="Ex: ART-005"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                {isCustomCategory ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Saisissez une nouvelle catégorie..."
                      required
                      className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormData({ ...formData, category: "" });
                      }} 
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Annuler"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === 'nouvelle_categorie') {
                        setIsCustomCategory(true);
                        setFormData({ ...formData, category: "" });
                      } else {
                        handleChange(e);
                      }
                    }}
                    required
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="Construction">Construction</option>
                    <option value="Agroalimentaire">Agroalimentaire</option>
                    <option value="Matières Premières">Matières Premières</option>
                    <option value="Autre">Autre</option>
                    <option value="nouvelle_categorie" className="font-semibold text-primary">+ Ajouter une nouvelle catégorie...</option>
                  </select>
                )}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="measure" className="block text-sm font-medium leading-6 text-gray-900">
                Unité de mesure <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <select
                  id="measure"
                  name="measure"
                  value={formData.measure}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                >
                  <option value="">Sélectionnez une unité</option>
                  <option value="Tonne">Tonne (t)</option>
                  <option value="Kilogramme">Kilogramme (kg)</option>
                  <option value="Litre">Litre (L)</option>
                  <option value="Botte">Botte</option>
                  <option value="Unité">Unité</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                Prix unitaire indicatif (F CFA)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ex: 85000"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Description ou notes
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Informations supplémentaires sur cet article..."
                />
              </div>
            </div>
          </div>
        </div>

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
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? "Enregistrer l'article" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
