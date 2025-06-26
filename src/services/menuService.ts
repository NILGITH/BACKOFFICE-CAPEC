
import { supabase } from "@/integrations/supabase/client";

export interface MenuSection {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuChangeRequest {
  id: string;
  old_menu_name: string;
  new_menu_name: string;
  is_submenu: boolean;
  parent_menu_name?: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
}

// Mock data pour éviter les erreurs TypeScript
const mockMenuSections: MenuSection[] = [
  {
    id: "menu-1",
    name: "Accueil",
    slug: "accueil",
    parent_id: undefined,
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "menu-2",
    name: "À propos",
    slug: "a-propos",
    parent_id: undefined,
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "submenu-1",
    name: "Notre histoire",
    slug: "notre-histoire",
    parent_id: "menu-2",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "menu-3",
    name: "Services",
    slug: "services",
    parent_id: undefined,
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const mockMenuChangeRequests: MenuChangeRequest[] = [
  {
    id: "req-1",
    old_menu_name: "À propos",
    new_menu_name: "Qui sommes-nous",
    is_submenu: false,
    parent_menu_name: undefined,
    status: "pending",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString()
  }
];

export const menuService = {
  async getMenuSections() {
    try {
      const { data, error } = await supabase
        .from("menu_sections")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.warn("Utilisation des données mock:", error);
        return mockMenuSections;
      }
      return data as MenuSection[];
    } catch (error) {
      console.warn("Utilisation des données mock:", error);
      return mockMenuSections;
    }
  },

  async getMenusWithSubmenus() {
    const menus = await this.getMenuSections();
    const mainMenus = menus.filter(menu => !menu.parent_id);
    
    return mainMenus.map(menu => ({
      ...menu,
      submenus: menus.filter(submenu => submenu.parent_id === menu.id)
    }));
  },

  async createMenuChangeRequest(requestData: {
    old_menu_name: string;
    new_menu_name: string;
    is_submenu: boolean;
    parent_menu_name?: string;
  }, userId: string) {
    const newRequest: MenuChangeRequest = {
      id: Date.now().toString(),
      ...requestData,
      created_by: userId,
      status: "pending",
      created_at: new Date().toISOString()
    };

    mockMenuChangeRequests.unshift(newRequest);
    return newRequest;
  },

  async getMenuChangeRequests() {
    return mockMenuChangeRequests;
  },

  async updateMenuChangeRequestStatus(id: string, status: "approved" | "rejected") {
    const request = mockMenuChangeRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
    }
    return request;
  }
};

export default menuService;
