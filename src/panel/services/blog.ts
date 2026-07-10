import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { BlogCategory, BlogPost } from '../types'

function requireClient() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase.')
  return supabase as unknown as SupabaseClient
}

interface BlogCategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
}

function mapCategory(row: BlogCategoryRow): BlogCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isActive: row.is_active,
  }
}

export async function listBlogCategories(): Promise<BlogCategory[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('blog_categories')
    .select('id, name, slug, description, is_active')
    .order('name', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar las categorías del blog: ${error.message}`)
  return (data as BlogCategoryRow[]).map(mapCategory)
}

export interface BlogCategoryInput {
  name: string
  slug: string
  description: string | null
  isActive: boolean
}

export async function createBlogCategory(input: BlogCategoryInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('blog_categories').insert({
    name: input.name,
    slug: input.slug,
    description: input.description,
    is_active: input.isActive,
  })
  if (error) throw new Error(`No se pudo crear la categoría: ${error.message}`)
}

export async function updateBlogCategory(id: string, input: BlogCategoryInput): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from('blog_categories')
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      is_active: input.isActive,
    })
    .eq('id', id)
  if (error) throw new Error(`No se pudo actualizar la categoría: ${error.message}`)
}

export async function deleteBlogCategory(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('blog_categories').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar la categoría: ${error.message}`)
}

interface BlogPostRow {
  id: string
  category_id: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  image_url: string | null
  status: BlogPost['status']
  published_at: string | null
  blog_categories: { name: string } | null
}

function mapPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.blog_categories?.name ?? null,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    status: row.status,
    publishedAt: row.published_at,
  }
}

const postColumns =
  'id, category_id, title, slug, excerpt, content, image_url, status, published_at, blog_categories(name)'

export async function listPosts(): Promise<BlogPost[]> {
  const client = requireClient()
  const { data, error } = await client
    .from('blog_posts')
    .select(postColumns)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw new Error(`No se pudieron cargar los artículos: ${error.message}`)
  return (data as unknown as BlogPostRow[]).map(mapPost)
}

export async function getPost(id: string): Promise<BlogPost | null> {
  const client = requireClient()
  const { data, error } = await client.from('blog_posts').select(postColumns).eq('id', id).maybeSingle()

  if (error) throw new Error(`No se pudo cargar el artículo: ${error.message}`)
  return data ? mapPost(data as unknown as BlogPostRow) : null
}

export interface BlogPostInput {
  categoryId: string | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  status: BlogPost['status']
  publishedAt: string | null
}

function toPostRecord(input: BlogPostInput) {
  return {
    category_id: input.categoryId,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    image_url: input.imageUrl,
    status: input.status,
    published_at: input.publishedAt,
  }
}

export async function createPost(input: BlogPostInput, authorId: string | null): Promise<string> {
  const client = requireClient()
  const { data, error } = await client
    .from('blog_posts')
    .insert({ ...toPostRecord(input), author_id: authorId })
    .select('id')
    .single()
  if (error) throw new Error(`No se pudo crear el artículo: ${error.message}`)
  return (data as { id: string }).id
}

export async function updatePost(id: string, input: BlogPostInput): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('blog_posts').update(toPostRecord(input)).eq('id', id)
  if (error) throw new Error(`No se pudo actualizar el artículo: ${error.message}`)
}

export async function deletePost(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el artículo: ${error.message}`)
}
