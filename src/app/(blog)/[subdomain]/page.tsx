/**
 * Blog Home Page
 *
 * Displays list of published posts for the tenant.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { resolveTenantFromSubdomain } from '@/lib/tenant/resolve'
import { getPublishedPostsByTenant } from '@/lib/db/queries/posts'

interface BlogHomeProps {
  params: Promise<{ subdomain: string }>
}

export default async function BlogHomePage({ params }: BlogHomeProps) {
  const { subdomain } = await params
  const tenant = await resolveTenantFromSubdomain(subdomain)

  if (!tenant) {
    notFound()
  }

  const posts = await getPublishedPostsByTenant(tenant.id)

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No posts yet.</p>
        <p className="mt-2 text-sm text-gray-400">
          Check back soon for new content!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {posts.map((post) => (
        <article key={post.id} className="group">
          <Link href={`/${subdomain}/${post.slug}`} className="block">
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600">
              {post.title}
            </h2>
          </Link>

          {post.excerpt && (
            <p className="mt-2 text-gray-600 line-clamp-2">{post.excerpt}</p>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
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
        </article>
      ))}
    </div>
  )
}
