import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { createClient } from '@/lib/supabase/server'
import SectionLabel from '@/components/shared/SectionLabel'
import type { BlogPost } from '@kalpak/shared'
import { formatDate } from '@kalpak/shared'

export const dynamicParams = true

type BlogPostWithAuthor = BlogPost & { profiles?: { full_name: string } | null }

async function getPost(slug: string): Promise<BlogPostWithAuthor | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*, profiles!author_id(full_name)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return data as BlogPostWithAuthor | null
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('is_published', true)
    return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  }
}

export default async function InsightPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const rawHtml = await marked(post.content)
  const contentHtml = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title', 'width', 'height'] },
  })

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-32 pb-8 bg-warm-white border-b border-stone-light/30">
        <div className="container-wide">
          <nav className="font-body text-xs text-stone mb-4">
            <Link href="/insights" className="hover:text-charcoal transition-colors">Insights</Link>
            <span className="mx-2">›</span>
            <span className="text-charcoal">{post.title}</span>
          </nav>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="font-body text-xs tracking-widest uppercase text-gold">{tag}</span>
              ))}
            </div>
          )}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-charcoal tracking-wide max-w-3xl mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 font-body text-xs text-stone">
            {post.profiles?.full_name && <span>{post.profiles.full_name}</span>}
            {post.published_at && (
              <>
                <span className="text-stone-light">·</span>
                <span>{formatDate(post.published_at)}</span>
              </>
            )}
            {post.reading_time_minutes && (
              <>
                <span className="text-stone-light">·</span>
                <span>{post.reading_time_minutes} min read</span>
              </>
            )}
          </div>
        </div>
      </div>

      {post.cover_image_url && (
        <div className="relative aspect-video w-full max-h-[560px] overflow-hidden">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <article className="section-pad bg-cream">
        <div className="max-w-2xl mx-auto px-4">
          <div
            className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:font-light prose-headings:tracking-wide prose-a:text-gold prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div className="mt-12 pt-8 border-t border-stone-light/30">
            <Link
              href="/insights"
              className="font-body text-sm text-stone hover:text-charcoal transition-colors"
            >
              ← Back to Insights
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
