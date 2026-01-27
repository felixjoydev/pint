import { prisma } from '../prisma'

export async function getTenantBySubdomain(subdomain: string) {
  return prisma.tenant.findUnique({
    where: { subdomain },
  })
}

export async function getTenantByCustomDomain(customDomain: string) {
  return prisma.tenant.findUnique({
    where: { customDomain },
  })
}

export async function getTenantById(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
  })
}

export async function getTenantByStripeCustomerId(stripeCustomerId: string) {
  return prisma.tenant.findUnique({
    where: { stripeCustomerId },
  })
}
