/* Legacy generated schema retained because the synced file cannot be deleted in-place.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          blog_category_id: string
          blog_post_id: string
          created_at: string
        }
        Insert: {
          blog_category_id: string
          blog_post_id: string
          created_at?: string
        }
        Update: {
          blog_category_id?: string
          blog_post_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_blog_category_id_fkey"
            columns: ["blog_category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["record_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          created_at: string
          enrollment_id: string
          expires_at: string | null
          id: string
          issued_at: string | null
          metadata: Json
          revocation_reason: string | null
          revoked_at: string | null
          status: Database["public"]["Enums"]["certificate_status"]
          storage_path: string | null
          title: string
          updated_at: string
          verification_token: string
        }
        Insert: {
          certificate_number: string
          created_at?: string
          enrollment_id: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          storage_path?: string | null
          title: string
          updated_at?: string
          verification_token?: string
        }
        Update: {
          certificate_number?: string
          created_at?: string
          enrollment_id?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          storage_path?: string | null
          title?: string
          updated_at?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country_code: string
          created_at: string
          email: string | null
          fundae_enabled: boolean
          id: string
          is_active: boolean
          legal_name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          slug: string
          tax_id: string | null
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          email?: string | null
          fundae_enabled?: boolean
          id?: string
          is_active?: boolean
          legal_name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          slug: string
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          email?: string | null
          fundae_enabled?: boolean
          id?: string
          is_active?: boolean
          legal_name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          slug?: string
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          is_manager: boolean
          job_title: string | null
          profile_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          is_manager?: boolean
          job_title?: string | null
          profile_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          is_manager?: boolean
          job_title?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          company_name: string | null
          course_id: string | null
          course_session_id: string | null
          created_at: string
          email: string
          id: string
          marketing_consent: boolean
          message: string | null
          metadata: Json
          name: string
          phone: string | null
          privacy_accepted_at: string
          request_type: Database["public"]["Enums"]["contact_request_type"]
          resolved_at: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["request_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          company_name?: string | null
          course_id?: string | null
          course_session_id?: string | null
          created_at?: string
          email: string
          id?: string
          marketing_consent?: boolean
          message?: string | null
          metadata?: Json
          name: string
          phone?: string | null
          privacy_accepted_at: string
          request_type?: Database["public"]["Enums"]["contact_request_type"]
          resolved_at?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          company_name?: string | null
          course_id?: string | null
          course_session_id?: string | null
          created_at?: string
          email?: string
          id?: string
          marketing_consent?: boolean
          message?: string | null
          metadata?: Json
          name?: string
          phone?: string | null
          privacy_accepted_at?: string
          request_type?: Database["public"]["Enums"]["contact_request_type"]
          resolved_at?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_course_session_id_fkey"
            columns: ["course_session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          capacity: number | null
          code: string
          company_id: string | null
          course_id: string
          created_at: string
          currency: string
          ends_at: string
          enrollment_closes_at: string | null
          enrollment_opens_at: string | null
          id: string
          is_fundae_eligible: boolean
          is_renewal_available: boolean
          kind: Database["public"]["Enums"]["session_kind"]
          modality: Database["public"]["Enums"]["course_modality"]
          practice_minutes: number
          price_cents: number
          public_notes: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          theory_minutes: number
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          capacity?: number | null
          code: string
          company_id?: string | null
          course_id: string
          created_at?: string
          currency?: string
          ends_at: string
          enrollment_closes_at?: string | null
          enrollment_opens_at?: string | null
          id?: string
          is_fundae_eligible?: boolean
          is_renewal_available?: boolean
          kind?: Database["public"]["Enums"]["session_kind"]
          modality: Database["public"]["Enums"]["course_modality"]
          practice_minutes?: number
          price_cents?: number
          public_notes?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["session_status"]
          theory_minutes?: number
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          capacity?: number | null
          code?: string
          company_id?: string | null
          course_id?: string
          created_at?: string
          currency?: string
          ends_at?: string
          enrollment_closes_at?: string | null
          enrollment_opens_at?: string | null
          id?: string
          is_fundae_eligible?: boolean
          is_renewal_available?: boolean
          kind?: Database["public"]["Enums"]["session_kind"]
          modality?: Database["public"]["Enums"]["course_modality"]
          practice_minutes?: number
          price_cents?: number
          public_notes?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          theory_minutes?: number
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          audience: Database["public"]["Enums"]["course_audience"]
          audience_description: string | null
          brochure_url: string | null
          category_id: string
          certification_name: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean
          is_fundae_eligible: boolean
          is_official_certification: boolean
          methodology: string | null
          modality: Database["public"]["Enums"]["course_modality"]
          objectives: string | null
          published_at: string | null
          short_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["course_audience"]
          audience_description?: string | null
          brochure_url?: string | null
          category_id: string
          certification_name?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_fundae_eligible?: boolean
          is_official_certification?: boolean
          methodology?: string | null
          modality?: Database["public"]["Enums"]["course_modality"]
          objectives?: string | null
          published_at?: string | null
          short_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["course_audience"]
          audience_description?: string | null
          brochure_url?: string | null
          category_id?: string
          certification_name?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_fundae_eligible?: boolean
          is_official_certification?: boolean
          methodology?: string | null
          modality?: Database["public"]["Enums"]["course_modality"]
          objectives?: string | null
          published_at?: string | null
          short_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          categoria: string
          color_acento: string
          created_at: string
          descripcion: string
          destacado: boolean
          duracion: string
          id: number
          imagen_url: string
          orden: number
          publicado: boolean
          slug: string
          titulo: string
          ubicacion: string
          updated_at: string
        }
        Insert: {
          categoria: string
          color_acento?: string
          created_at?: string
          descripcion?: string
          destacado?: boolean
          duracion?: string
          id?: number
          imagen_url: string
          orden?: number
          publicado?: boolean
          slug: string
          titulo: string
          ubicacion?: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          color_acento?: string
          created_at?: string
          descripcion?: string
          destacado?: boolean
          duracion?: string
          id?: number
          imagen_url?: string
          orden?: number
          publicado?: boolean
          slug?: string
          titulo?: string
          ubicacion?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          attendance_percentage: number | null
          cancellation_reason: string | null
          company_id: string | null
          completed_at: string | null
          course_session_id: string
          created_at: string
          currency: string
          enrolled_by: string | null
          enrollment_number: string
          id: string
          is_renewal: boolean
          marketing_consent: boolean
          metadata: Json
          payment_status: Database["public"]["Enums"]["payment_status"]
          privacy_accepted_at: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          attendance_percentage?: number | null
          cancellation_reason?: string | null
          company_id?: string | null
          completed_at?: string | null
          course_session_id: string
          created_at?: string
          currency?: string
          enrolled_by?: string | null
          enrollment_number?: string
          id?: string
          is_renewal?: boolean
          marketing_consent?: boolean
          metadata?: Json
          payment_status?: Database["public"]["Enums"]["payment_status"]
          privacy_accepted_at: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          unit_price_cents?: number
          updated_at?: string
        }
        Update: {
          attendance_percentage?: number | null
          cancellation_reason?: string | null
          company_id?: string | null
          completed_at?: string | null
          course_session_id?: string
          created_at?: string
          currency?: string
          enrolled_by?: string | null
          enrollment_number?: string
          id?: string
          is_renewal?: boolean
          marketing_consent?: boolean
          metadata?: Json
          payment_status?: Database["public"]["Enums"]["payment_status"]
          privacy_accepted_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_session_id_fkey"
            columns: ["course_session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          course_id: string | null
          created_at: string
          id: string
          question: string
          sort_order: number
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          answer: string
          course_id?: string | null
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          answer?: string
          course_id?: string | null
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_address: Json
          billing_name: string
          billing_tax_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          due_at: string | null
          enrollment_id: string
          id: string
          invoice_number: string | null
          issued_at: string | null
          payment_id: string | null
          pdf_path: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          billing_address?: Json
          billing_name: string
          billing_tax_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          due_at?: string | null
          enrollment_id: string
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          payment_id?: string | null
          pdf_path?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_cents: number
          tax_cents?: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          billing_address?: Json
          billing_name?: string
          billing_tax_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          due_at?: string | null
          enrollment_id?: string
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          payment_id?: string | null
          pdf_path?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          autonomous_community: string | null
          city: string
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          postal_code: string | null
          province: string
          slug: string
          updated_at: string
        }
        Insert: {
          autonomous_community?: string | null
          city: string
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          postal_code?: string | null
          province: string
          slug: string
          updated_at?: string
        }
        Update: {
          autonomous_community?: string | null
          city?: string
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          postal_code?: string | null
          province?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          bucket_id: string
          created_at: string
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          metadata: Json
          mime_type: string | null
          object_path: string
          size_bytes: number | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket_id: string
          created_at?: string
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          metadata?: Json
          mime_type?: string | null
          object_path: string
          size_bytes?: number | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket_id?: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          metadata?: Json
          mime_type?: string | null
          object_path?: string
          size_bytes?: number | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          enrollment_id: string
          failure_code: string | null
          failure_message: string | null
          id: string
          metadata: Json
          paid_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id: string | null
          provider_payment_id: string | null
          refunded_amount_cents: number
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          enrollment_id: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_payment_id?: string | null
          refunded_amount_cents?: number
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          enrollment_id?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          metadata?: Json
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_payment_id?: string | null
          refunded_amount_cents?: number
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          profile_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          profile_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          profile_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          last_sign_in_at: string | null
          locale: string
          marketing_consent: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          last_sign_in_at?: string | null
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          last_sign_in_at?: string | null
          locale?: string
          marketing_consent?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: Database["public"]["Enums"]["app_role"]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: Database["public"]["Enums"]["app_role"]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: Database["public"]["Enums"]["app_role"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          blog_post_id: string | null
          canonical_url: string | null
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          robots: string
          route_path: string
          status: Database["public"]["Enums"]["record_status"]
          structured_data: Json
          title: string
          updated_at: string
        }
        Insert: {
          blog_post_id?: string | null
          canonical_url?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          robots?: string
          route_path: string
          status?: Database["public"]["Enums"]["record_status"]
          structured_data?: Json
          title: string
          updated_at?: string
        }
        Update: {
          blog_post_id?: string | null
          canonical_url?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          robots?: string
          route_path?: string
          status?: Database["public"]["Enums"]["record_status"]
          structured_data?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_metadata_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: true
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_metadata_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      session_schedules: {
        Row: {
          block_type: Database["public"]["Enums"]["schedule_block_type"]
          course_session_id: string
          created_at: string
          ends_at: string
          id: string
          sort_order: number
          starts_at: string
          title: string | null
          updated_at: string
        }
        Insert: {
          block_type?: Database["public"]["Enums"]["schedule_block_type"]
          course_session_id: string
          created_at?: string
          ends_at: string
          id?: string
          sort_order?: number
          starts_at: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["schedule_block_type"]
          course_session_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          sort_order?: number
          starts_at?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_schedules_course_session_id_fkey"
            columns: ["course_session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_trainers: {
        Row: {
          course_session_id: string
          created_at: string
          is_lead: boolean
          trainer_id: string
        }
        Insert: {
          course_session_id: string
          created_at?: string
          is_lead?: boolean
          trainer_id: string
        }
        Update: {
          course_session_id?: string
          created_at?: string
          is_lead?: boolean
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_trainers_course_session_id_fkey"
            columns: ["course_session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_trainers_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      student_private_data: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          birth_date: string | null
          city: string | null
          country_code: string
          created_at: string
          identity_document: string | null
          identity_document_type:
            | Database["public"]["Enums"]["identity_document_type"]
            | null
          postal_code: string | null
          province: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          birth_date?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          identity_document?: string | null
          identity_document_type?:
            | Database["public"]["Enums"]["identity_document_type"]
            | null
          postal_code?: string | null
          province?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          birth_date?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          identity_document?: string | null
          identity_document_type?:
            | Database["public"]["Enums"]["identity_document_type"]
            | null
          postal_code?: string | null
          province?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_private_data_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          profile_id: string | null
          student_number: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          profile_id?: string | null
          student_number?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          profile_id?: string | null
          student_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          avatar_url: string | null
          company_name: string | null
          content: string
          course_id: string | null
          created_at: string
          id: string
          is_featured: boolean
          published_at: string | null
          rating: number | null
          sort_order: number
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          avatar_url?: string | null
          company_name?: string | null
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          rating?: number | null
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          avatar_url?: string | null
          company_name?: string | null
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          rating?: number | null
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          bio: string | null
          certifications: string[]
          created_at: string
          id: string
          is_active: boolean
          profile_id: string
          specialties: string[]
          updated_at: string
        }
        Insert: {
          bio?: string | null
          certifications?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          profile_id: string
          specialties?: string[]
          updated_at?: string
        }
        Update: {
          bio?: string | null
          certifications?: string[]
          created_at?: string
          id?: string
          is_active?: boolean
          profile_id?: string
          specialties?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          accessibility_notes: string | null
          address_line1: string
          address_line2: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          directions: string | null
          id: string
          is_active: boolean
          is_public: boolean
          location_id: string
          name: string
          postal_code: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          accessibility_notes?: string | null
          address_line1: string
          address_line2?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          directions?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          location_id: string
          name: string
          postal_code?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          accessibility_notes?: string | null
          address_line1?: string
          address_line2?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          directions?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          location_id?: string
          name?: string
          postal_code?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_enrollment: {
        Args: { target_enrollment_id: string }
        Returns: boolean
      }
      can_access_student: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      can_access_student_private: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_company_manager: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      is_session_trainer: {
        Args: { target_session_id: string }
        Returns: boolean
      }
      normalize_identity_document: { Args: { value: string }; Returns: string }
      verify_certificate: {
        Args: { p_identity_document: string; p_verification_token: string }
        Returns: {
          certificate_number: string
          certificate_status: Database["public"]["Enums"]["certificate_status"]
          certificate_title: string
          course_title: string
          expires_at: string
          issued_at: string
          student_name: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "student" | "company" | "trainer"
      certificate_status: "draft" | "issued" | "revoked" | "expired"
      contact_request_type:
        | "general"
        | "course_info"
        | "company_training"
        | "in_company"
        | "fundae"
        | "career"
      course_audience: "individuals" | "companies" | "both"
      course_modality: "presential" | "online" | "hybrid"
      enrollment_status:
        | "pending"
        | "confirmed"
        | "waitlisted"
        | "cancelled"
        | "attended"
        | "no_show"
        | "completed"
      identity_document_type: "dni" | "nie" | "passport" | "other"
      invoice_status: "draft" | "issued" | "paid" | "void" | "refunded"
      media_kind: "image" | "video" | "document" | "certificate" | "other"
      payment_provider: "stripe" | "bank_transfer" | "cash" | "manual"
      payment_status:
        | "unpaid"
        | "pending"
        | "paid"
        | "partially_refunded"
        | "refunded"
        | "failed"
        | "cancelled"
      record_status: "draft" | "published" | "archived"
      request_status: "new" | "in_progress" | "resolved" | "spam" | "closed"
      schedule_block_type: "theory" | "practice" | "exam" | "other"
      session_kind: "open" | "in_company"
      session_status:
        | "draft"
        | "scheduled"
        | "open"
        | "full"
        | "in_progress"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student", "company", "trainer"],
      certificate_status: ["draft", "issued", "revoked", "expired"],
      contact_request_type: [
        "general",
        "course_info",
        "company_training",
        "in_company",
        "fundae",
        "career",
      ],
      course_audience: ["individuals", "companies", "both"],
      course_modality: ["presential", "online", "hybrid"],
      enrollment_status: [
        "pending",
        "confirmed",
        "waitlisted",
        "cancelled",
        "attended",
        "no_show",
        "completed",
      ],
      identity_document_type: ["dni", "nie", "passport", "other"],
      invoice_status: ["draft", "issued", "paid", "void", "refunded"],
      media_kind: ["image", "video", "document", "certificate", "other"],
      payment_provider: ["stripe", "bank_transfer", "cash", "manual"],
      payment_status: [
        "unpaid",
        "pending",
        "paid",
        "partially_refunded",
        "refunded",
        "failed",
        "cancelled",
      ],
      record_status: ["draft", "published", "archived"],
      request_status: ["new", "in_progress", "resolved", "spam", "closed"],
      schedule_block_type: ["theory", "practice", "exam", "other"],
      session_kind: ["open", "in_company"],
      session_status: [
        "draft",
        "scheduled",
        "open",
        "full",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
*/

export * from './database.generated'
