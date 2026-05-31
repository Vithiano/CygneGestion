"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const pseudo = e.target.pseudo.value;
    const password = e.target.password.value;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("pseudo", pseudo)
        .eq("password", password)
        .single();

      if (error || !data) {
        setErrorModal({ isOpen: true, message: "Pseudo ou mot de passe incorrect." });
        setIsLoading(false);
        return;
      }

      if (data.status !== "Actif") {
        setErrorModal({ isOpen: true, message: "Votre compte est inactif. Veuillez contacter un administrateur." });
        setIsLoading(false);
        return;
      }

      // Connexion réussie
      localStorage.setItem("currentUser", JSON.stringify(data));
      window.location.href = "/"; // Force a full reload to apply layout changes
    } catch (err) {
      console.error(err);
      setErrorModal({ isOpen: true, message: "Une erreur de réseau est survenue." });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <h2 className="mt-8 text-3xl font-bold leading-9 tracking-tight text-gray-900">
              CygneGestion
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Bienvenue. Connectez-vous pour accéder à votre espace de travail.
            </p>
          </div>

          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="pseudo" className="block text-sm font-medium leading-6 text-gray-900">
                    Pseudo (Nom d'utilisateur)
                  </label>
                  <div className="mt-2 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="pseudo"
                      name="pseudo"
                      type="text"
                      autoComplete="username"
                      required
                      className="block w-full rounded-xl border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                      placeholder="votre_pseudo"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Mot de passe
                  </label>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-700">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm leading-6">
                    <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Image/Gradient */}
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-indigo-900 mix-blend-multiply opacity-90"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="https://images.unsplash.com/photo-1586528116311-ad8ed7c663be?q=80&w=2070&auto=format&fit=crop"
          alt="Logistics background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-12 left-12 right-12 text-white animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
          <h3 className="text-3xl font-bold mb-4">Gérez vos bons d'entrée avec efficacité</h3>
          <ul className="space-y-3">
            {[
              "Suivi en temps réel des réceptions",
              "Gestion centralisée des clients et articles",
              "Tableaux de bord analytiques performants"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-slate-200">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de connexion</h3>
              <p className="text-sm text-gray-500">{errorModal.message}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-center">
              <button
                type="button"
                onClick={() => setErrorModal({ isOpen: false, message: "" })}
                className="w-full inline-flex justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
