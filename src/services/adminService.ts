import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  /**
   * Créer un utilisateur administrateur
   */
  async createAdminUser(email: string, password: string, fullName: string) {
    try {
      // Créer l'utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "admin"
          }
        }
      });

      if (authError) {
        return {
          success: false,
          message: `Erreur: ${authError.message}`
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: "Erreur lors de la création de l'utilisateur"
        };
      }

      // Créer ou mettre à jour le profil
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role: "admin"
        });

      if (profileError) {
        return {
          success: false,
          message: `Profil créé mais erreur: ${profileError.message}`
        };
      }

      return {
        success: true,
        message: `Utilisateur admin créé avec succès (${email})`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  },

  /**
   * Créer un utilisateur standard
   */
  async createStandardUser(email: string, password: string, fullName: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "user"
          }
        }
      });

      if (authError) {
        return {
          success: false,
          message: `Erreur: ${authError.message}`
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: "Erreur lors de la création de l'utilisateur"
        };
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role: "user"
        });

      if (profileError) {
        return {
          success: false,
          message: `Profil créé mais erreur: ${profileError.message}`
        };
      }

      return {
        success: true,
        message: `Utilisateur standard créé avec succès (${email})`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  },

  /**
   * Initialiser les menus principaux et sous-menus
   */
  async initializeMainMenus() {
    try {
      // Supprimer tous les menus existants
      const { error: deleteError } = await supabase
        .from("menu_sections")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        return {
          success: false,
          message: `Erreur lors de la suppression: ${deleteError.message}`
        };
      }

      // Créer les menus principaux
      const mainMenus = [
        { name: "Accueil", slug: "accueil", display_order: 1 },
        { name: "La CAPEC", slug: "la-capec", display_order: 2 },
        { name: "Recherche", slug: "recherche", display_order: 3 },
        { name: "Formation", slug: "formation", display_order: 4 },
        { name: "Publications", slug: "publications", display_order: 5 },
        { name: "Partenaires", slug: "partenaires", display_order: 6 },
        { name: "Contact", slug: "contact", display_order: 7 }
      ];

      const { data: createdMenus, error: menusError } = await supabase
        .from("menu_sections")
        .insert(mainMenus)
        .select();

      if (menusError) {
        return {
          success: false,
          message: `Erreur lors de la création des menus: ${menusError.message}`
        };
      }

      // Créer les sous-menus
      const submenus = [];

      // Sous-menus de "La CAPEC"
      const capecMenu = createdMenus?.find(m => m.name === "La CAPEC");
      if (capecMenu) {
        submenus.push(
          { name: "Mission", slug: "mission", parent_id: capecMenu.id, display_order: 1 },
          { name: "Objectifs", slug: "objectifs", parent_id: capecMenu.id, display_order: 2 },
          { name: "Historique", slug: "historique", parent_id: capecMenu.id, display_order: 3 }
        );
      }

      // Sous-menus de "Recherche"
      const rechercheMenu = createdMenus?.find(m => m.name === "Recherche");
      if (rechercheMenu) {
        submenus.push(
          { name: "Axes de recherche", slug: "axes-recherche", parent_id: rechercheMenu.id, display_order: 1 },
          { name: "Projets en cours", slug: "projets-cours", parent_id: rechercheMenu.id, display_order: 2 },
          { name: "Méthodologie", slug: "methodologie", parent_id: rechercheMenu.id, display_order: 3 }
        );
      }

      // Sous-menus de "Formation"
      const formationMenu = createdMenus?.find(m => m.name === "Formation");
      if (formationMenu) {
        submenus.push(
          { name: "Programmes", slug: "programmes", parent_id: formationMenu.id, display_order: 1 },
          { name: "Ateliers", slug: "ateliers", parent_id: formationMenu.id, display_order: 2 },
          { name: "Séminaires", slug: "seminaires", parent_id: formationMenu.id, display_order: 3 }
        );
      }

      // Sous-menus de "Publications"
      const publicationsMenu = createdMenus?.find(m => m.name === "Publications");
      if (publicationsMenu) {
        submenus.push(
          { name: "Notes de politique", slug: "notes-politique", parent_id: publicationsMenu.id, display_order: 1 },
          { name: "Documents de travail", slug: "documents-travail", parent_id: publicationsMenu.id, display_order: 2 },
          { name: "Rapports d'activités", slug: "rapports-activites", parent_id: publicationsMenu.id, display_order: 3 },
          { name: "Ouvrages", slug: "ouvrages", parent_id: publicationsMenu.id, display_order: 4 }
        );
      }

      if (submenus.length > 0) {
        const { error: submenusError } = await supabase
          .from("menu_sections")
          .insert(submenus);

        if (submenusError) {
          return {
            success: false,
            message: `Menus créés mais erreur sous-menus: ${submenusError.message}`
          };
        }
      }

      return {
        success: true,
        message: `${mainMenus.length} menus et ${submenus.length} sous-menus créés avec succès`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de l'initialisation"
      };
    }
  }
};

export default adminService;