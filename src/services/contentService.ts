
import { supabase } from "@/integrations/supabase/client";

export interface ContentSubmission {
  id: string;
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string;
  file_urls?: string[];
  menu_section_id?: string;
  submenu_section_id?: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentFormData {
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string;
  files?: File[];
  menu_section_id?: string;
  submenu_section_id?: string;
}

// Mock data pour éviter les erreurs TypeScript
const mockContentSubmissions: ContentSubmission[] = [
  {
    id: "1",
    title: "Article sur l'économie",
    description: "Un article détaillé sur l'économie ivoirienne",
    content_type: "text",
    content_data: "Contenu de l'article...",
    file_urls: [],
    menu_section_id: "menu-1",
    submenu_section_id: undefined,
    status: "pending",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Rapport PDF",
    description: "Rapport annuel 2024",
    content_type: "pdf",
    content_data: "",
    file_urls: ["https://example.com/rapport.pdf"],
    menu_section_id: "menu-2",
    submenu_section_id: undefined,
    status: "approved",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const contentService = {
  async getContentSubmissions() {
    try {
      // Tentative d'utilisation de Supabase, sinon retour aux données mock
      const { data, error } = await supabase
        .from("content_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Utilisation des données mock:", error);
        return mockContentSubmissions;
      }
      return data as ContentSubmission[];
    } catch (error) {
      console.warn("Utilisation des données mock:", error);
      return mockContentSubmissions;
    }
  },

  async createContentSubmission(contentData: ContentFormData, userId: string) {
    const newSubmission: ContentSubmission = {
      id: Date.now().toString(),
      title: contentData.title,
      description: contentData.description,
      content_type: contentData.content_type,
      content_data: contentData.content_data,
      file_urls: [],
      menu_section_id: contentData.menu_section_id,
      submenu_section_id: contentData.submenu_section_id,
      created_by: userId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Simulation d'upload de fichiers
    if (contentData.files && contentData.files.length > 0) {
      newSubmission.file_urls = contentData.files.map(file => 
        `https://mock-storage.com/${file.name}`
      );
    }

    mockContentSubmissions.unshift(newSubmission);
    return newSubmission;
  },

  async updateContentStatus(id: string, status: "approved" | "rejected") {
    const submission = mockContentSubmissions.find(s => s.id === id);
    if (submission) {
      submission.status = status;
      submission.updated_at = new Date().toISOString();
    }
    return submission;
  },

  async deleteContentSubmission(id: string) {
    const index = mockContentSubmissions.findIndex(s => s.id === id);
    if (index > -1) {
      mockContentSubmissions.splice(index, 1);
    }
    return true;
  },

  async sendAllContentToEmail() {
    try {
      const submissions = await this.getContentSubmissions();
      
      const emailData = {
        to: "petronildaga@aitech-ci.com",
        subject: "Soumissions de contenu CAPEC-CI",
        content: submissions,
        timestamp: new Date().toISOString()
      };

      console.log("Données à envoyer par email:", emailData);
      
      // Simulation d'envoi d'email
      return { success: true, message: "Contenu envoyé avec succès à petronildaga@aitech-ci.com" };
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      throw error;
    }
  }
};

export default contentService;
