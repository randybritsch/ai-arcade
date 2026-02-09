import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          title: string;
          url: string;
          description: string | null;
          author: string | null;
          tags: string[];
          submitted_at: string;
          featured: boolean;
          play_count: number;
          status: 'active' | 'hidden';
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          description?: string | null;
          author?: string | null;
          tags?: string[];
          submitted_at?: string;
          featured?: boolean;
          play_count?: number;
          status?: 'active' | 'hidden';
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          description?: string | null;
          author?: string | null;
          tags?: string[];
          submitted_at?: string;
          featured?: boolean;
          play_count?: number;
          status?: 'active' | 'hidden';
        };
      };
    };
  };
}
