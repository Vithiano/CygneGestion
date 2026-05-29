import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "SaaS Gestion de Bons d'Entrée",
  description: "Plateforme de gestion de bons d'entrée et facturation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
