"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, Settings2, ShieldCheck, Save, Upload, Users } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form states
  const [companyData, setCompanyData] = useState({
    name: "CygneGestion SARL",
    email: "contact@cygnegastion.ci",
    phone: "+225 01 02 03 04 05",
    address: "Zone Industrielle, Yopougon, Abidjan",
    rccm: "CI-ABJ-2023-B-12345",
    nif: "123456789X"
  });

  useEffect(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, []);

  const [prefsData, setPrefsData] = useState({
    currency: "XOF",
    language: "fr",
    dateFormat: "DD/MM/YYYY"
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [permissions, setPermissions] = useState({
    "Administrateur": { vouchers: true, articles: true, customers: true, users: true, settings: true },
    "Manager": { vouchers: true, articles: true, customers: true, users: false, settings: false },
    "Opérateur": { vouchers: true, articles: false, customers: false, users: false, settings: false }
  });

  const togglePermission = (role, module) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Save to localStorage for client-side persistence
    if (logoPreview) {
      try {
        localStorage.setItem('companyLogo', logoPreview);
      } catch (error) {
        console.error("Storage error:", error);
        alert("L'image est trop volumineuse pour être sauvegardée. Veuillez choisir une image plus petite (moins de 2 MB).");
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      // Optional: show a success toast here
    }, 800);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: "company", name: "Profil de l'Entreprise", icon: Building2 },
    { id: "preferences", name: "Préférences Générales", icon: Settings2 },
    { id: "security", name: "Sécurité", icon: ShieldCheck },
    { id: "roles", name: "Rôles & Permissions", icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Paramètres</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gérez la configuration globale de votre plateforme CygneGestion.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SIDEBAR TABS */}
        <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <nav className="flex flex-col p-2 space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSave}>
            {/* COMPANY SETTINGS */}
            {activeTab === "company" && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profil de l'Entreprise</h2>
                  <p className="text-sm text-gray-500 mt-1">Ces informations apparaîtront sur vos bons d'entrée et rapports PDF.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Logo Upload Mock */}
                  <div className="sm:col-span-2 flex items-center gap-6">
                    <div className="h-20 w-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative group">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo de l'entreprise" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoChange}
                        accept="image/png, image/jpeg, image/svg+xml"
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Changer le logo
                      </button>
                      <p className="mt-2 text-xs text-gray-500">JPG, PNG ou SVG. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Nom de l'entreprise</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Email de contact</label>
                    <div className="mt-2">
                      <input
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Numéro de téléphone</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Adresse complète</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={companyData.address}
                        onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900">N° RCCM</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={companyData.rccm}
                        onChange={(e) => setCompanyData({...companyData, rccm: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900">N° de Compte Contribuable (NCC)</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={companyData.nif}
                        onChange={(e) => setCompanyData({...companyData, nif: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES SETTINGS */}
            {activeTab === "preferences" && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Préférences Générales</h2>
                  <p className="text-sm text-gray-500 mt-1">Configurez le comportement par défaut de l'interface.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Devise par défaut</label>
                    <div className="mt-2">
                      <select
                        value={prefsData.currency}
                        onChange={(e) => setPrefsData({...prefsData, currency: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      >
                        <option value="XOF">Franc CFA (XOF)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar US ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Format de date</label>
                    <div className="mt-2">
                      <select
                        value={prefsData.dateFormat}
                        onChange={(e) => setPrefsData({...prefsData, dateFormat: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      >
                        <option value="DD/MM/YYYY">JJ/MM/AAAA (ex: 28/05/2026)</option>
                        <option value="MM/DD/YYYY">MM/JJ/AAAA (ex: 05/28/2026)</option>
                        <option value="YYYY-MM-DD">AAAA-MM-JJ (ex: 2026-05-28)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Langue de l'interface</label>
                    <div className="mt-2">
                      <select
                        value={prefsData.language}
                        onChange={(e) => setPrefsData({...prefsData, language: e.target.value})}
                        className="block w-full sm:w-1/2 rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY SETTINGS */}
            {activeTab === "security" && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                  <p className="text-sm text-gray-500 mt-1">Gérez votre mot de passe et vos paramètres de connexion.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Mot de passe actuel</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Nouveau mot de passe</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">Confirmer le nouveau mot de passe</label>
                    <div className="mt-2">
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            {/* ROLES & PERMISSIONS SETTINGS */}
            {activeTab === "roles" && (
              <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Rôles & Permissions</h2>
                    <p className="text-sm text-gray-500 mt-1">Définissez ce que chaque rôle peut voir ou modifier sur la plateforme.</p>
                  </div>
                  <button type="button" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors">
                    + Nouveau rôle
                  </button>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-gray-900">Modules & Fonctionnalités</th>
                        <th className="px-6 py-4 font-semibold text-center text-gray-900">Administrateur</th>
                        <th className="px-6 py-4 font-semibold text-center text-gray-900">Manager</th>
                        <th className="px-6 py-4 font-semibold text-center text-gray-900">Opérateur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {[
                        { id: 'vouchers', name: "Bons d'entrée" },
                        { id: 'articles', name: "Catalogue Articles" },
                        { id: 'customers', name: "Gestion Clients" },
                        { id: 'users', name: "Utilisateurs & Accès" },
                        { id: 'settings', name: "Paramètres Globaux" },
                      ].map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-medium text-gray-900">{module.name}</td>
                          {["Administrateur", "Manager", "Opérateur"].map((role) => (
                            <td key={role} className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(role, module.id)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${permissions[role][module.id] ? 'bg-primary' : 'bg-gray-200'}`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${permissions[role][module.id] ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FORM FOOTER / SAVE BUTTON */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
