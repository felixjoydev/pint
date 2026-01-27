/**
 * Individual Post Page
 *
 * Displays a single published post.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { resolveTenantFromSubdomain } from '@/lib/tenant/resolve'
import { getPostBySlug } from '@/lib/db/queries/posts'

interface PostPageProps {
  params: Promise<{ subdomain: string; slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { subdomain, slug } = await params
  const tenant = await resolveTenantFromSubdomain(subdomain)

  if (!tenant) {
    notFound()
  }

  const post = await getPostBySlug(tenant.id, slug)

  // Only show published posts
  if (!post || post.status !== 'published') {
    notFound()
  }

  return (
    <article>
      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()}>
              {post.publishedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="prose prose-gray max-w-none">
        {/*
          TODO: Render Tiptap JSON content properly.
          For now, display raw JSON as placeholder.
          Will be replaced with proper Tiptap renderer in Phase 7.
        */}
        <pre className="whitespace-pre-wrap rounded bg-gray-50 p-4 text-sm">
          {JSON.stringify(post.content, null, 2)}
        </pre>
      </div>

      {/* Back Link */}
      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link
          href={`/${subdomain}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to all posts
        </Link>
      </div>
    </article>
  )
}
