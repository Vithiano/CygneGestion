"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UserPlus, UserCog, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function UserFormPage({ params }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!isNew);
  const [showPassword, setShowPassword] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    pseudo: "",
    email: "", 
    fonction: "",
    role: "",
    status: "Actif",
    password: ""
  });

  useEffect(() => {
    async function fetchUser() {
      if (!isNew) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (data) {
          setFormData({
            name: data.name || "",
            pseudo: data.pseudo || "",
            email: data.email || "",
            fonction: data.fonction || "",
            role: data.role || "",
            status: data.status || "Actif",
            password: data.password || "" // On laisse le mot de passe vide par sécurité ou on affiche le mot de passe si on est en clair
          });
        }
        setIsFetching(false);
      }
    }
    fetchUser();
  }, [params.id, isNew]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = {
      name: formData.name,
      pseudo: formData.pseudo,
      email: formData.email,
      fonction: formData.fonction,
      role: formData.role,
      status: formData.status,
      password: formData.password // À sécuriser/hacher plus tard lors de l'intégration finale de l'authentification
    };

    if (isNew) {
      payload.user_id = 'USR-' + Date.now().toString().slice(-4);
      const { error } = await supabase.from('users').insert([payload]);
      if (error) {
        alert("Erreur lors de la création de l'utilisateur : " + error.message);
        setIsLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('users').update(payload).eq('id', params.id);
      if (error) {
        alert("Erreur lors de la modification de l'utilisateur : " + error.message);
        setIsLoading(false);
        return;
      }
    }

    window.location.href = "/users";
  };

  if (isFetching) {
    return <div className="p-8 text-center text-gray-500">Chargement des données...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isNew ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isNew ? "Renseignez les informations pour créer un nouvel accès." : "Mettez à jour les informations et les droits d'accès."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
             {isNew ? <UserPlus className="h-5 w-5 text-primary" /> : <UserCog className="h-5 w-5 text-primary" />}
             <h2 className="text-base font-semibold text-gray-900">Informations du profil</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Nom et Prénom <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Jean Dupont"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="fonction" className="block text-sm font-medium leading-6 text-gray-900">
                Fonction <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="fonction"
                  id="fonction"
                  value={formData.fonction}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Responsable des stocks"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="pseudo" className="block text-sm font-medium leading-6 text-gray-900">
                Pseudo (Nom d'utilisateur) <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="pseudo"
                  id="pseudo"
                  value={formData.pseudo}
                  onChange={handleChange}
                  required
                  placeholder="Ex: jdupont"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Adresse Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: jean@cygnegastion.ci"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                Rôle système <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                {isCustomRole ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="Saisissez un nouveau rôle..."
                      required
                      className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsCustomRole(false);
                        setFormData({ ...formData, role: "" });
                      }} 
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      title="Annuler"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => {
                      if (e.target.value === 'nouveau_role') {
                        setIsCustomRole(true);
                        setFormData({ ...formData, role: "" });
                      } else {
                        handleChange(e);
                      }
                    }}
                    required
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  >
                    <option value="">Sélectionnez un rôle</option>
                    <option value="Administrateur">Administrateur (Accès total)</option>
                    <option value="Manager">Manager (Supervision)</option>
                    <option value="Opérateur">Opérateur (Saisie de bons)</option>
                    <option value="nouveau_role" className="font-semibold text-primary">+ Ajouter un nouveau rôle...</option>
                  </select>
                )}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                Statut du compte <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif (Bloqué)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 pt-4 border-t border-gray-100">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Mot de passe {isNew && <span className="text-red-500">*</span>}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {isNew ? "Définissez le mot de passe initial de l'utilisateur." : "Laissez vide si vous ne souhaitez pas modifier le mot de passe actuel."}
              </p>
              <div className="mt-2 relative md:w-1/2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={isNew}
                  placeholder="••••••••"
                  className="block w-full rounded-md border-0 py-2.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? "Créer l'utilisateur" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
