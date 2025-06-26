export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      content_submissions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content_type: "text" | "image" | "video" | "pdf";
          content_data: string | null; // Corrected this line
          file_urls: string[] | null;
          menu_section_id: string | null;
          submenu_section_id: string | null;
          status: "pending" | "approved" | "rejected";
          created_by: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          content_type: "text" | "image" | "video" | "pdf";
          content_data?: string | null;
          file_urls?: string[] | null;
          menu_section_id?: string | null;
          submenu_section_id?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_by: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          content_type?: "text" | "image" | "video" | "pdf";
          content_data?: string | null;
          file_urls?: string[] | null;
          menu_section_id?: string | null;
          submenu_section_id?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_by?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      menu_sections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      menu_change_requests: {
        Row: {
          id: string;
          old_menu_name: string;
          new_menu_name: string;
          is_submenu: boolean;
          parent_menu_name: string | null;
          status: "pending" | "approved" | "rejected";
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          old_menu_name: string;
          new_menu_name: string;
          is_submenu: boolean;
          parent_menu_name?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          old_menu_name?: string;
          new_menu_name?: string;
          is_submenu?: boolean;
          parent_menu_name?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      // Add other tables if necessary, with 'any' for now to ensure parsing
    };
    Enums: {
      content_type: "text" | "image" | "video" | "pdf";
      submission_status: "pending" | "approved" | "rejected";
    };
    Views: {
      [_in: string]: never;
    };
    Functions: {
      [_in: string]: never;
    };
    CompositeTypes: {
      [_in: string]: never;
    };
  };
}
