import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'
import type { BlogPost } from '@kalpak/shared'
import { formatDate } from '@kalpak/shared'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Design ideas, project stories, and industry perspectives from Kalpak Design Studio.',
}

type BlogPostWithAuthor = BlogPost & { profiles?: { full_name: string } | null }

export default async function InsightsPage() {
  let posts: BlogPostWithAuthor[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*, profiles!author_id(full_name)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    posts = (data ?? []) as BlogPostWithAuthor[]
  } catch {
    posts = []
  }

  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-20 bg-warm-white border-b border-stone-light/30">
        <div className="container-wide">
          <SectionLabel>Our Blog</SectionLabel>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-charcoal tracking-wide max-w-2xl">
            Insights
          </h1>
          <p className="font-body text-sm text-stone mt-4 max-w-lg leading-relaxed">
            Design ideas, project stories, and industry perspectives from our studio.
          </p>
        </div>
      </div>

      <section className="section-pad bg-cream">
        <div className="container-wide">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-heading text-2xl font-light text-stone tracking-wide mb-3">Insights Coming Soon</p>
              <p className="font-body text-sm text-stone/70">
                Check back for design tips, project stories, and industry perspectives.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/insights/${post.slug}`} className="group block">
                  <article>
                    {post.cover_image_url && (
                      <div className="relative aspect-video overflow-hidden mb-4">
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="font-body text-xs tracking-widest uppercase text-gold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-heading text-xl font-light text-charcoal tracking-wide mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="font-body text-sm text-stone leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 font-body text-xs text-stone/70">
                      {post.profiles?.full_name && <span>{post.profiles.full_name}</span>}
                      {post.published_at && (
                        <>
                          <span>·</span>
                          <span>{formatDate(post.published_at)}</span>
                        </>
                      )}
                      {post.reading_time_minutes && (
                        <>
                          <span>·</span>
                          <span>{post.reading_time_minutes} min read</span>
                        </>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
