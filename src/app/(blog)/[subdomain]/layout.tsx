/**
 * Tenant Blog Layout
 *
 * Resolves tenant from subdomain and renders blog header.
 * Shows 404 if tenant doesn't exist.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { resolveTenantFromSubdomain } from '@/lib/tenant/resolve'

interface TenantSettings {
  title?: string
  description?: string
  theme?: string
}

interface BlogLayoutProps {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}

export default async function SubdomainBlogLayout({
  children,
  params,
}: BlogLayoutProps) {
  const { subdomain } = await params
  const tenant = await resolveTenantFromSubdomain(subdomain)

  if (!tenant) {
    notFound()
  }

  const settings = (tenant.settings || {}) as TenantSettings
  const blogTitle = settings.title || subdomain

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <Link href={`/${subdomain}`} className="block">
            <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              {blogTitle}
            </h1>
          </Link>
          {settings.description && (
            <p className="mt-1 text-gray-600">{settings.description}</p>
          )}
        </div>
      </header>

      {/* Blog Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>

      {/* Blog Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://pint.im"
              className="underline hover:text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pint
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
