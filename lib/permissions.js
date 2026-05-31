// lib/permissions.js

export const ROLE_PERMISSIONS = {
  "Administrateur": {
    "dashboard": true,
    "vouchers": true,
    "articles": true,
    "customers": true,
    "users": true,
    "settings": true,
  },
  "Manager": {
    "dashboard": true,
    "vouchers": true,
    "articles": true,
    "customers": true,
    "users": false,
    "settings": false,
  },
  "Opérateur": {
    "dashboard": true,
    "vouchers": true,
    "articles": false,
    "customers": false,
    "users": false,
    "settings": false,
  }
};

// Map URL paths to their required module permission
export const PATH_TO_MODULE = {
  "/": "dashboard",
  "/vouchers": "vouchers",
  "/bons": "vouchers", // Pour /bons/new, /bons/[id]
  "/articles": "articles",
  "/customers": "customers",
  "/users": "users",
  "/settings": "settings"
};

export function hasPermission(role, moduleName) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role][moduleName] === true;
}

export function canAccessPath(role, pathname) {
  // Always allow login
  if (pathname === "/login") return true;

  // Find the base module for this pathname
  let requiredModule = null;
  for (const [path, mod] of Object.entries(PATH_TO_MODULE)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      requiredModule = mod;
      break;
    }
  }

  // Si on ne trouve pas le module (par exemple route inconnue), on autorise par défaut, 
  // ou on pourrait le bloquer. Pour l'instant on autorise s'il n'y a pas de restriction spécifique.
  if (!requiredModule) return true;

  return hasPermission(role, requiredModule);
}
