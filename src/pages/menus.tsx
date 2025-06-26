
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { menuService, MenuChangeRequest } from "@/services/menuService";
import { CheckCircle, Clock, XCircle, Send } from "lucide-react";

export default function MenusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [oldMenuName, setOldMenuName] = useState("");
  const [newMenuName, setNewMenuName] = useState("");
  const [isSubmenu, setIsSubmenu] = useState(false);
  const [parentMenuName, setParentMenuName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<MenuChangeRequest[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await menuService.getMenuChangeRequests();
      setRequests(data);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await menuService.createMenuChangeRequest({
        old_menu_name: oldMenuName,
        new_menu_name: newMenuName,
        is_submenu: isSubmenu,
        parent_menu_name: isSubmenu ? parentMenuName : undefined
      }, user.email);

      setMessage("Demande de modification soumise avec succès!");
      setOldMenuName("");
      setNewMenuName("");
      setIsSubmenu(false);
      setParentMenuName("");
      loadRequests();
    } catch (error) {
      setMessage("Erreur lors de la soumission de la demande");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-orange-600" />;
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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Layout title="Gestion des Menus">
      <div className="space-y-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Demander une modification de menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oldMenu">Libellé actuel du menu/sous-menu</Label>
                  <Input
                    id="oldMenu"
                    value={oldMenuName}
                    onChange={(e) => setOldMenuName(e.target.value)}
                    placeholder="Ex: À propos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newMenu">Nouveau libellé souhaité</Label>
                  <Input
                    id="newMenu"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="Ex: Qui sommes-nous"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isSubmenu"
                  checked={isSubmenu}
                  onCheckedChange={(checked) => setIsSubmenu(checked as boolean)}
                />
                <Label htmlFor="isSubmenu">Il s'agit d'un sous-menu</Label>
              </div>

              {isSubmenu && (
                <div className="space-y-2">
                  <Label htmlFor="parentMenu">Menu parent</Label>
                  <Input
                    id="parentMenu"
                    value={parentMenuName}
                    onChange={(e) => setParentMenuName(e.target.value)}
                    placeholder="Ex: À propos"
                    required
                  />
                </div>
              )}

              {message && (
                <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-xl text-green-800">Historique des demandes</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Aucune demande de modification</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="font-medium">{getStatusText(request.status)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Ancien libellé:</span> {request.old_menu_name}
                      </div>
                      <div>
                        <span className="font-medium">Nouveau libellé:</span> {request.new_menu_name}
                      </div>
                      {request.is_submenu && (
                        <div>
                          <span className="font-medium">Menu parent:</span> {request.parent_menu_name}
                        </div>
                      )}
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
