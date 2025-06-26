import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contentService, ContentSubmission } from "@/services/contentService";
import { menuService, MenuSection } from "@/services/menuService";
import { 
  Eye, 
  FileText as FileTextIcon, // Renamed to avoid conflict if FileText is used as component
  Image as ImageIcon, // Renamed to avoid conflict
  Video as VideoIcon, // Renamed to avoid conflict
  FileIcon as FileIconLucide, // Renamed to avoid conflict
  CheckCircle, 
  Clock, 
  XCircle, 
  Send,
  Plus,
  Download,
  Trash2
} from "lucide-react";
import Link from "next/link";

export default function ContentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [submissionsData, menusData] = await Promise.all([
        contentService.getContentSubmissions(),
        menuService.getMenuSections()
      ]);
      setSubmissions(submissionsData);
      setMenus(menusData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileTextIcon className="h-5 w-5 text-blue-600" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-green-600" />;
      case "video":
        return <VideoIcon className="h-5 w-5 text-purple-600" />;
      case "pdf":
        return <FileIconLucide className="h-5 w-5 text-red-600" />;
      default:
        return <FileTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      default:
        return "En attente";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getMenuName = (menuId?: string) => {
    if (!menuId) return "Non assigné";
    const menu = menus.find(m => m.id === menuId);
    return menu?.name || "Menu inconnu";
  };

  const handleSendAllContent = async () => {
    setIsSending(true);
    setMessage("");

    try {
      const result = await contentService.sendAllContentToEmail();
      setMessage(result.message);
    } catch (error) {
      setMessage("Erreur lors de l'envoi des données");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette soumission ?")) {
      try {
        await contentService.deleteContentSubmission(id);
        setSubmissions(prev => prev.filter(s => s.id !== id));
        setMessage("Soumission supprimée avec succès");
      } catch (error) {
        setMessage("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  if (loading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const approvedSubmissions = submissions.filter(s => s.status === "approved");
  const rejectedSubmissions = submissions.filter(s => s.status === "rejected");

  return (
    <Layout title="Contenu Soumis">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion du Contenu</h1>
            <p className="text-gray-600">Vue d'ensemble de tous les contenus soumis</p>
          </div>
          <div className="flex gap-3">
            <Link href="/content/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter du contenu
              </Button>
            </Link>
            <Button 
              onClick={handleSendAllContent}
              disabled={isSending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Envoi..." : "Envoyer tout par email"}
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">En attente</p>
                  <p className="text-2xl font-bold text-orange-700">{pendingSubmissions.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approuvés</p>
                  <p className="text-2xl font-bold text-green-700">{approvedSubmissions.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Rejetés</p>
                  <p className="text-2xl font-bold text-red-700">{rejectedSubmissions.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Toutes les soumissions de contenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun contenu soumis pour le moment</p>
                <Link href="/content/new">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter le premier contenu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(submission.content_type)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                          {submission.description && (
                            <p className="text-sm text-gray-600 mt-1">{submission.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {getStatusText(submission.status)}
                          </div>
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 capitalize">{submission.content_type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Menu:</span>
                        <span className="ml-2">{getMenuName(submission.menu_section_id)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Sous-menu:</span>
                        <span className="ml-2">{getMenuName(submission.submenu_section_id)}</span>
                      </div>
                    </div>

                    {submission.content_data && submission.content_type === "text" && (
                      <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                        <span className="font-medium text-gray-700">Contenu:</span>
                        <p className="mt-1 text-gray-600 line-clamp-3">
                          {submission.content_data.substring(0, 200)}
                          {submission.content_data.length > 200 && "..."}
                        </p>
                      </div>
                    )}

                    {submission.file_urls && submission.file_urls.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700 text-sm">Fichiers attachés:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {submission.file_urls.map((url, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(url, "_blank")}
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Fichier {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
                      <span>Soumis par: {submission.created_by}</span>
                      <span>{new Date(submission.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
