/**
 * Tenant Constants
 *
 * Reserved subdomains and domain configuration for multi-tenancy.
 */

/**
 * Subdomains that cannot be claimed by users.
 * These are reserved for system use or common paths.
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'blog',
  'help',
  'support',
  'mail',
  'email',
  'static',
  'assets',
  'cdn',
  'status',
  'docs',
  'dev',
  'staging',
  'test',
  'demo',
  'beta',
  'alpha',
  'auth',
  'login',
  'signin',
  'signup',
  'register',
  'account',
  'settings',
  'billing',
  'pricing',
  'about',
  'contact',
  'legal',
  'privacy',
  'terms',
  'faq',
] as const

export type ReservedSubdomain = (typeof RESERVED_SUBDOMAINS)[number]

/**
 * Root domain for the application.
 * Used to extract subdomains from hostnames.
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
