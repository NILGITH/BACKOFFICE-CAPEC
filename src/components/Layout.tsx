import { ReactNode } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <>
      <SEO title={title} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo et titre */}
              <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition">
                <Image 
                  src="/logo-capec-mcdb23oy.png" 
                  alt="CAPEC Logo" 
                  width={40} 
                  height={40}
                  className="rounded"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CAPEC</h1>
                  <p className="text-xs text-gray-500">Collecte de données</p>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 transition">
                  Accueil
                </Link>
                <Link href="/content/new" className="text-gray-600 hover:text-orange-500 transition">
                  Nouveau contenu
                </Link>
                <Link href="/menus" className="text-gray-600 hover:text-orange-500 transition">
                  Menus
                </Link>
                <Link href="/statistics" className="text-gray-600 hover:text-orange-500 transition">
                  Statistiques
                </Link>
                <Link href="/overview" className="text-gray-600 hover:text-orange-500 transition">
                  Vue d'ensemble
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-gray-600 text-sm">
              © 2026 CAPEC - Application de collecte de données pour capec-ci.org
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
