import { useState } from "react";
import { Shield, X, KeyRound } from "lucide-react";

export default function AdminAuthModal({ isOpen, onClose, onConfirm, itemName }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    // Simulate network delay for verification
    setTimeout(() => {
      if (password === "admin123") {
        onConfirm();
        setPassword("");
      } else {
        setError("Mot de passe administrateur incorrect.");
      }
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Autorisation requise
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            La suppression de <strong className="font-semibold text-gray-900">{itemName}</strong> nécessite des privilèges administratifs. Veuillez saisir le mot de passe administrateur pour confirmer.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
                Mot de passe Administrateur
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoFocus
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm sm:text-sm focus:ring-2 focus:ring-offset-0 transition-colors ${
                    error 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900 placeholder-red-300" 
                      : "border-gray-300 focus:border-primary focus:ring-primary/20 text-gray-900"
                  }`}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 animate-in slide-in-from-top-1 fade-in duration-200">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isVerifying ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : null}
              Confirmer la suppression
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
