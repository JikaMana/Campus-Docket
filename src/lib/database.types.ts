export type ComplaintStatus =
  | "open"
  | "in_review"
  | "pending_info"
  | "resolved"
  | "closed"
  | "escalated";
export type ComplaintPriority = "low" | "medium" | "high" | "urgent";
export type UserRole = "student" | "src_officer" | "super_admin";

export interface University {
  id: string;
  name: string;
  short_name: string;
  email_domain: string;
  logo_url: string | null;
  monthly_fee: number;
  is_paid: boolean;
  billing_details: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  university_id: string | null;
  full_name: string;
  student_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  ref_code: string;
  university_id: string;
  student_id: string;
  assigned_to: string | null;
  category: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  author_id: string;
  message: string;
  is_internal: boolean;
  status_change: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  complaint_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

type EmptyRelationships = [];

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: University;
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          email_domain: string;
          logo_url?: string | null;
          monthly_fee?: number;
          is_paid?: boolean;
          billing_details?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          short_name?: string;
          email_domain?: string;
          logo_url?: string | null;
          monthly_fee?: number;
          is_paid?: boolean;
          billing_details?: string | null;
          created_at?: string;
        };
        Relationships: EmptyRelationships;
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          university_id?: string | null;
          full_name?: string;
          student_number?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          university_id?: string | null;
          full_name?: string;
          student_number?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: EmptyRelationships;
      };
      complaints: {
        Row: Complaint;
        Insert: {
          id?: string;
          ref_code: string;
          university_id: string;
          student_id: string;
          assigned_to?: string | null;
          category: string;
          title: string;
          description: string;
          status?: ComplaintStatus;
          priority?: ComplaintPriority;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ref_code?: string;
          university_id?: string;
          student_id?: string;
          assigned_to?: string | null;
          category?: string;
          title?: string;
          description?: string;
          status?: ComplaintStatus;
          priority?: ComplaintPriority;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: EmptyRelationships;
      };
      complaint_updates: {
        Row: ComplaintUpdate;
        Insert: {
          id?: string;
          complaint_id: string;
          author_id: string;
          message: string;
          is_internal?: boolean;
          status_change?: string | null;
          created_at?: string;
        };
        Update: {
          complaint_id?: string;
          author_id?: string;
          message?: string;
          is_internal?: boolean;
          status_change?: string | null;
          created_at?: string;
        };
        Relationships: EmptyRelationships;
      };
      attachments: {
        Row: Attachment;
        Insert: {
          id?: string;
          complaint_id: string;
          uploader_id: string;
          file_name: string;
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          complaint_id?: string;
          uploader_id?: string;
          file_name?: string;
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: EmptyRelationships;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_ref_code: {
        Args: {
          uni_short: string;
        };
        Returns: string;
      };
    };
  };
}
