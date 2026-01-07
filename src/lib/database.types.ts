export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          user_id: string | null
          name: string
          category: string
          quantity: number
          unit: string | null
          expiry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          category: string
          quantity: number
          unit?: string | null
          expiry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          category?: string
          quantity?: number
          unit?: string | null
          expiry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: number
          created_at?: string
        }
      }
      user_recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          prep_time: number
          servings: number
          difficulty: string
          ingredients: Json
          steps: Json
          image_url: string | null
          video_url: string | null
          thumbnail_url: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          prep_time: number
          servings: number
          difficulty: string
          ingredients: Json
          steps: Json
          image_url?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          prep_time?: number
          servings?: number
          difficulty?: string
          ingredients?: Json
          steps?: Json
          image_url?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}




