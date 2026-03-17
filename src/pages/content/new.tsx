import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Image as ImageIcon, Video, FileUp, X, Eye } from "lucide-react";
import { contentService } from "@/services/contentService";
import { menuService, MenuSection } from "@/services/menuService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function NewContent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"text" | "image" | "video" | "pdf">("text");
  const [contentData, setContentData] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [selectedSubmenuId, setSelectedSubmenuId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ type: string; url: string } | null>(null);

  useEffect(() => {
    loadMenuSections();
  }, []);

  const loadMenuSections = async () => {
    try {
      const sections = await menuService.getMenuSections();
      setMenuSections(sections);
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les menus"
      });
    }
  };

  const mainMenus = menuSections.filter(section => !section.parent_id);
  const submenus = selectedMenuId 
    ? menuSections.filter(section => section.parent_id === selectedMenuId)
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/") ? "image" : 
                 file.type.startsWith("video/") ? "video" : "pdf";
    setPreviewContent({ type, url });
    setPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre est requis"
      });
      return;
    }

    if (!selectedMenuId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un menu"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await contentService.createContentSubmission({
        title: title.trim(),
        description: description.trim(),
        content_type: contentType,
        content_data: contentData.trim(),
        files,
        menu_section_id: selectedMenuId,
        submenu_section_id: selectedSubmenuId || undefined
      }, "anonymous");

      toast({
        title: "Succès",
        description: "Contenu soumis avec succès"
      });

      // Réinitialiser le formulaire
      setTitle("");
      setDescription("");
      setContentData("");
      setFiles([]);
      setSelectedMenuId("");
      setSelectedSubmenuId("");
      setContentType("text");

    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la soumission du contenu"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Soumettre du contenu">
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Soumettre du nouveau contenu</CardTitle>
            <CardDescription>
              Ajoutez des images, vidéos, documents PDF ou du texte pour le site CAPEC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre du contenu"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du contenu..."
                  rows={3}
                />
              </div>

              {/* Menu principal */}
              <div className="space-y-2">
                <Label htmlFor="menu">Menu principal *</Label>
                <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                  <SelectTrigger id="menu">
                    <SelectValue placeholder="Sélectionnez un menu" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sous-menu */}
              {submenus.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="submenu">Sous-menu (optionnel)</Label>
                  <Select value={selectedSubmenuId} onValueChange={setSelectedSubmenuId}>
                    <SelectTrigger id="submenu">
                      <SelectValue placeholder="Sélectionnez un sous-menu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {submenus.map((submenu) => (
                        <SelectItem key={submenu.id} value={submenu.id}>
                          {submenu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Type de contenu */}
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    type="button"
                    variant={contentType === "text" ? "default" : "outline"}
                    onClick={() => setContentType("text")}
                    className="flex flex-col items-center py-6"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Texte</span>
                  </Button>
                  <Button
                    type="button"
                    variant={contentType === "image" ? "default" : "outline"}
                    onClick={() => setContentType("image")}
                    className="flex flex-col items-center py-6"
                  >
                    <ImageIcon className="h-6 w-6 mb-2" />
                    <span>Image</span>
                  </Button>
                  <Button
                    type="button"
                    variant={contentType === "video" ? "default" : "outline"}
                    onClick={() => setContentType("video")}
                    className="flex flex-col items-center py-6"
                  >
                    <Video className="h-6 w-6 mb-2" />
                    <span>Vidéo</span>
                  </Button>
                  <Button
                    type="button"
                    variant={contentType === "pdf" ? "default" : "outline"}
                    onClick={() => setContentType("pdf")}
                    className="flex flex-col items-center py-6"
                  >
                    <FileUp className="h-6 w-6 mb-2" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>

              {/* Contenu texte */}
              {contentType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu texte</Label>
                  <Textarea
                    id="content"
                    value={contentData}
                    onChange={(e) => setContentData(e.target.value)}
                    placeholder="Saisissez votre contenu ici..."
                    rows={8}
                  />
                </div>
              )}

              {/* Upload de fichiers */}
              {contentType !== "text" && (
                <div className="space-y-4">
                  <Label htmlFor="files">
                    Fichiers {contentType === "image" ? "images" : contentType === "video" ? "vidéos" : "PDF"}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition">
                    <input
                      id="files"
                      type="file"
                      multiple
                      accept={
                        contentType === "image" ? "image/*" :
                        contentType === "video" ? "video/*" :
                        "application/pdf"
                      }
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        Cliquez pour sélectionner ou glissez vos fichiers ici
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {contentType === "image" && "Formats supportés: JPG, PNG, GIF, WEBP"}
                        {contentType === "video" && "Formats supportés: MP4, MOV, AVI, WEBM"}
                        {contentType === "pdf" && "Format supporté: PDF"}
                      </p>
                    </label>
                  </div>

                  {/* Liste des fichiers */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Fichiers sélectionnés ({files.length})</Label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {contentType === "image" && <ImageIcon className="h-5 w-5 text-blue-500" />}
                              {contentType === "video" && <Video className="h-5 w-5 text-purple-500" />}
                              {contentType === "pdf" && <FileUp className="h-5 w-5 text-red-500" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    setContentData("");
                    setFiles([]);
                    setSelectedMenuId("");
                    setSelectedSubmenuId("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? "Envoi en cours..." : "Soumettre le contenu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de prévisualisation */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prévisualisation</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewContent?.type === "image" && (
              <img 
                src={previewContent.url} 
                alt="Preview" 
                className="w-full h-auto rounded-lg"
              />
            )}
            {previewContent?.type === "video" && (
              <video 
                src={previewContent.url} 
                controls 
                className="w-full h-auto rounded-lg"
              />
            )}
            {previewContent?.type === "pdf" && (
              <iframe 
                src={previewContent.url} 
                className="w-full h-[600px] rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}