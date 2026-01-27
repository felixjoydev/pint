/**
 * Tenant Resolution Utilities
 *
 * Functions for resolving tenants from subdomains and custom domains.
 * Used by middleware and server components for multi-tenancy.
 */

import { prisma } from '@/lib/db/prisma'
import { RESERVED_SUBDOMAINS, ROOT_DOMAIN } from './constants'

/**
 * Extract subdomain from a hostname.
 *
 * @param hostname - The full hostname (e.g., 'myblog.pint.im' or 'myblog.pint.im:3000')
 * @returns The subdomain if valid, null otherwise
 *
 * @example
 * extractSubdomain('myblog.pint.im') // 'myblog'
 * extractSubdomain('localhost:3000') // null
 * extractSubdomain('www.pint.im') // null (reserved)
 * extractSubdomain('pint.im') // null (root domain)
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]

  // localhost or IP address - no subdomain
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }

  // Get root domain without port
  const rootDomain = ROOT_DOMAIN.split(':')[0]

  // Check if it's a subdomain of root domain
  if (host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.replace(`.${rootDomain}`, '')

    // Ignore reserved subdomains
    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase() as any)) {
      return null
    }

    // Ignore multi-level subdomains (e.g., 'a.b.pint.im')
    if (subdomain.includes('.')) {
      return null
    }

    return subdomain.toLowerCase()
  }

  // Not a subdomain of our root domain - might be custom domain
  return null
}

/**
 * Resolve a tenant from the database by subdomain.
 *
 * @param subdomain - The subdomain to look up
 * @returns The tenant if found, null otherwise
 */
export async function resolveTenantFromSubdomain(subdomain: string) {
  return prisma.tenant.findUnique({
    where: { subdomain: subdomain.toLowerCase() },
    select: {
      id: true,
      subdomain: true,
      customDomain: true,
      settings: true,
      tier: true,
    },
  })
}

/**
 * Resolve a tenant from the database by custom domain.
 *
 * @param domain - The custom domain to look up
 * @returns The tenant if found, null otherwise
 */
export async function resolveTenantFromCustomDomain(domain: string) {
  return prisma.tenant.findUnique({
    where: { customDomain: domain.toLowerCase() },
    select: {
      id: true,
      subdomain: true,
      customDomain: true,
      settings: true,
      tier: true,
    },
  })
}

/**
 * Resolve a tenant from a hostname (subdomain or custom domain).
 *
 * First tries to extract and resolve by subdomain.
 * If that fails, tries to resolve by custom domain.
 *
 * @param hostname - The full hostname from the request
 * @returns The tenant if found, null otherwise
 */
export async function resolveTenant(hostname: string) {
  const subdomain = extractSubdomain(hostname)

  if (subdomain) {
    return resolveTenantFromSubdomain(subdomain)
  }

  // Try custom domain (hostname without port)
  const domain = hostname.split(':')[0]

  // Don't look up root domain or localhost as custom domain
  const rootDomain = ROOT_DOMAIN.split(':')[0]
  if (domain === rootDomain || domain === 'localhost') {
    return null
  }

  return resolveTenantFromCustomDomain(domain)
}

/**
 * Check if a subdomain is valid and potentially available.
 *
 * This performs basic validation only (format and reserved words).
 * To check database availability, use checkSubdomainAvailability().
 *
 * @param subdomain - The subdomain to validate
 * @returns True if the subdomain format is valid and not reserved
 */
export function isSubdomainValid(subdomain: string): boolean {
  const normalized = subdomain.toLowerCase()

  // Check reserved list
  if (RESERVED_SUBDOMAINS.includes(normalized as any)) {
    return false
  }

  // Basic validation: alphanumeric and hyphens only
  // Must start and end with alphanumeric
  // Length: 3-30 characters
  const validPattern = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/

  return validPattern.test(normalized)
}

/**
 * Check if a subdomain is available (not taken and valid).
 *
 * @param subdomain - The subdomain to check
 * @returns Object with availability status and reason if unavailable
 */
export async function checkSubdomainAvailability(
  subdomain: string
): Promise<{ available: boolean; reason?: string }> {
  const normalized = subdomain.toLowerCase()

  // Check basic validity first
  if (!isSubdomainValid(normalized)) {
    if (RESERVED_SUBDOMAINS.includes(normalized as any)) {
      return { available: false, reason: 'This subdomain is reserved' }
    }
    return { available: false, reason: 'Invalid subdomain format' }
  }

  // Check database
  const existing = await prisma.tenant.findUnique({
    where: { subdomain: normalized },
    select: { id: true },
  })

  if (existing) {
    return { available: false, reason: 'This subdomain is already taken' }
  }

  return { available: true }
}
