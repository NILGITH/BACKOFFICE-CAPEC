import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Plus, Edit, Trash2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { menuService, MenuSection, MenuChangeRequest } from "@/services/menuService";

export default function MenusPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [requests, setRequests] = useState<MenuChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuSection | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [newMenuData, setNewMenuData] = useState({
    old_menu_name: "",
    new_menu_name: "",
    is_submenu: false,
    parent_menu_name: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, requestData] = await Promise.all([
        menuService.getMenuSections(),
        menuService.getMenuChangeRequests()
      ]);
      setMenus(menuData);
      setRequests(requestData);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setAlert({ type: "error", message: "Erreur lors du chargement des données" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await menuService.createMenuChangeRequest({
        old_menu_name: "Nouveau",
        new_menu_name: newMenuData.new_menu_name,
        is_submenu: newMenuData.is_submenu,
        parent_menu_name: newMenuData.is_submenu ? newMenuData.parent_menu_name : undefined
      }, "anonymous");

      setAlert({ type: "success", message: "Demande d'ajout envoyée avec succès !" });
      setShowAddDialog(false);
      setNewMenuData({ old_menu_name: "", new_menu_name: "", is_submenu: false, parent_menu_name: "" });
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
      setAlert({ type: "error", message: "Erreur lors de l'envoi de la demande" });
    }
  };

  const handleEditMenuRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu) return;

    try {
      await menuService.createMenuChangeRequest({
        old_menu_name: selectedMenu.name,
        new_menu_name: newMenuData.new_menu_name,
        is_submenu: !!selectedMenu.parent_id,
        parent_menu_name: selectedMenu.parent_id ? 
          menus.find(m => m.id === selectedMenu.parent_id)?.name : undefined
      }, "anonymous");

      setAlert({ type: "success", message: "Demande de modification envoyée avec succès !" });
      setShowEditDialog(false);
      setSelectedMenu(null);
      setNewMenuData({ old_menu_name: "", new_menu_name: "", is_submenu: false, parent_menu_name: "" });
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
      setAlert({ type: "error", message: "Erreur lors de l'envoi de la demande" });
    }
  };

  const mainMenus = menus.filter(menu => !menu.parent_id);

  const getSubmenus = (parentId: string) => {
    return menus.filter(menu => menu.parent_id === parentId);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Menu className="h-8 w-8 text-orange-600" />
                Gestion des Menus
              </h1>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Demander un nouveau menu
            </Button>
          </div>

          {alert && (
            <Alert className={`mb-6 ${alert.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
              <AlertDescription className={alert.type === "success" ? "text-green-700" : "text-red-700"}>
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
                <CardTitle>Menus Actuels</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <p className="text-center text-gray-500">Chargement...</p>
                ) : mainMenus.length === 0 ? (
                  <p className="text-center text-gray-500">Aucun menu disponible</p>
                ) : (
                  <div className="space-y-4">
                    {mainMenus.map((menu) => {
                      const submenus = getSubmenus(menu.id);
                      return (
                        <div key={menu.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-gray-800">{menu.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMenu(menu);
                                setNewMenuData({ old_menu_name: menu.name, new_menu_name: menu.name, is_submenu: false, parent_menu_name: "" });
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          {submenus.length > 0 && (
                            <div className="ml-4 mt-2 space-y-2">
                              {submenus.map((submenu) => (
                                <div key={submenu.id} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <span>↳ {submenu.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMenu(submenu);
                                      setNewMenuData({ 
                                        old_menu_name: submenu.name, 
                                        new_menu_name: submenu.name, 
                                        is_submenu: true, 
                                        parent_menu_name: menu.name 
                                      });
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle>Demandes en attente</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {requests.length === 0 ? (
                  <p className="text-center text-gray-500">Aucune demande en attente</p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {request.old_menu_name} → {request.new_menu_name}
                            </p>
                            {request.parent_menu_name && (
                              <p className="text-sm text-gray-600">Menu parent: {request.parent_menu_name}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            request.status === "approved" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {request.status === "pending" ? "En attente" :
                             request.status === "approved" ? "Approuvé" : "Rejeté"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog Ajout Menu */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander un nouveau menu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMenuRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nom du menu</label>
              <Input
                value={newMenuData.new_menu_name}
                onChange={(e) => setNewMenuData({ ...newMenuData, new_menu_name: e.target.value })}
                placeholder="Ex: Projets"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_submenu"
                checked={newMenuData.is_submenu}
                onChange={(e) => setNewMenuData({ ...newMenuData, is_submenu: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_submenu" className="text-sm">C'est un sous-menu</label>
            </div>
            {newMenuData.is_submenu && (
              <div>
                <label className="block text-sm font-semibold mb-2">Menu parent</label>
                <Select
                  value={newMenuData.parent_menu_name}
                  onValueChange={(value) => setNewMenuData({ ...newMenuData, parent_menu_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un menu parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.name}>{menu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Envoyer la demande
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Modification Menu */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander une modification de menu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMenuRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nom actuel</label>
              <Input value={newMenuData.old_menu_name} disabled className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nouveau nom</label>
              <Input
                value={newMenuData.new_menu_name}
                onChange={(e) => setNewMenuData({ ...newMenuData, new_menu_name: e.target.value })}
                placeholder="Ex: Nouvelles Publications"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Envoyer la demande
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}