import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contentService, ContentFormData } from "@/services/contentService";
import { menuService, MenuSection } from "@/services/menuService";
import { 
  Upload, 
  FileText as FileTextIcon, // Renamed
  Image as ImageIcon, // Renamed
  Video as VideoIcon, // Renamed
  FileIcon as FileIconLucide, // Renamed
  Plus, 
  X 
} from "lucide-react";

export default function NewContentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"text" | "image" | "video" | "pdf">("text");
  const [contentData, setContentData] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [menuSectionId, setMenuSectionId] = useState("");
  const [submenuSectionId, setSubmenuSectionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [submenus, setSubmenus] = useState<MenuSection[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadMenus();
  }, []);

  useEffect(() => {
    if (menuSectionId) {
      const selectedSubmenus = menus.filter(menu => menu.parent_id === menuSectionId);
      setSubmenus(selectedSubmenus);
      setSubmenuSectionId("");
    } else {
      setSubmenus([]);
      setSubmenuSectionId("");
    }
  }, [menuSectionId, menus]);

  const loadMenus = async () => {
    try {
      const data = await menuService.getMenuSections();
      setMenus(data);
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const formData: ContentFormData = {
        title,
        description,
        content_type: contentType,
        content_data: contentData,
        files: files.length > 0 ? files : undefined,
        menu_section_id: menuSectionId || undefined,
        submenu_section_id: submenuSectionId || undefined
      };

      await contentService.createContentSubmission(formData, user.email);

      setMessage("Contenu soumis avec succès!");
      setTitle("");
      setDescription("");
      setContentData("");
      setFiles([]);
      setMenuSectionId("");
      setSubmenuSectionId("");
      
      setTimeout(() => {
        router.push("/content");
      }, 2000);
    } catch (error) {
      setMessage("Erreur lors de la soumission du contenu");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileTextIcon className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <VideoIcon className="h-5 w-5" />;
      case "pdf":
        return <FileIconLucide className="h-5 w-5" />;
      default:
        return <FileTextIcon className="h-5 w-5" />;
    }
  };

  const mainMenus = menus.filter(menu => !menu.parent_id);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Layout title="Ajouter du Contenu">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-xl text-green-800 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter du nouveau contenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du contenu *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Nouveau rapport économique"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Type de contenu *</Label>
                  <Select value={contentType} onValueChange={(value: "text" | "image" | "video" | "pdf") => setContentType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-4 w-4" />
                          Texte
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <VideoIcon className="h-4 w-4" />
                          Vidéo
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileIconLucide className="h-4 w-4" />
                          PDF
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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

              {contentType === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="contentData">Contenu textuel *</Label>
                  <Textarea
                    id="contentData"
                    value={contentData}
                    onChange={(e) => setContentData(e.target.value)}
                    placeholder="Saisissez votre contenu ici..."
                    rows={8}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu">Menu principal</Label>
                  <Select value={menuSectionId} onValueChange={setMenuSectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un menu" />
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
                {submenus.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="submenu">Sous-menu</Label>
                    <Select value={submenuSectionId} onValueChange={setSubmenuSectionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un sous-menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {submenus.map((submenu) => (
                          <SelectItem key={submenu.id} value={submenu.id}>
                            {submenu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label>Fichiers à télécharger</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                    </p>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept={contentType === "image" ? "image/*" : contentType === "video" ? "video/*" : contentType === "pdf" ? ".pdf" : "*"}
                      className="hidden"
                      id="fileInput"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("fileInput")?.click()}
                    >
                      Sélectionner des fichiers
                    </Button>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Fichiers sélectionnés:</Label>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(contentType)}
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message && (
                <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Envoi en cours..." : "Soumettre le contenu"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/content")}
                  className="px-8"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
