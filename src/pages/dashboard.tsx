import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Menu, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord CAPEC
          </h1>
          <p className="text-gray-600">
            Collecte de données pour le site capec-ci.org
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Soumettre du contenu */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Soumettre du contenu</CardTitle>
              <CardDescription>
                Ajoutez des images, vidéos, textes ou PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/content/new">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Nouveau contenu
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gérer les menus */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Menu className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Gérer les menus</CardTitle>
              <CardDescription>
                Demander des modifications de menus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/menus">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Voir les menus
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>
                Visualisez les données collectées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/statistics">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Voir statistiques
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Vue d'ensemble */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Vue d'ensemble</CardTitle>
              <CardDescription>
                Aperçu global des données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/overview">
                <Button className="w-full bg-purple-500 hover:bg-purple-600">
                  Vue d'ensemble
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Section informative */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bienvenue sur l'application de collecte CAPEC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Cette application vous permet de collecter et soumettre facilement des données 
                pour mettre à jour le site web capec-ci.org.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">📝 Contenu</h3>
                  <p className="text-sm text-gray-600">
                    Soumettez des images, vidéos, fichiers PDF ou du texte pour enrichir le site.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">🗂️ Menus</h3>
                  <p className="text-sm text-gray-600">
                    Proposez des modifications ou ajouts aux menus et sous-menus du site.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">📊 Statistiques</h3>
                  <p className="text-sm text-gray-600">
                    Consultez les analyses et tendances des données collectées.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">👁️ Vue d'ensemble</h3>
                  <p className="text-sm text-gray-600">
                    Accédez à une vision globale de toutes les soumissions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}