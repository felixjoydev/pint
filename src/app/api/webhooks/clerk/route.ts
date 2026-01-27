import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers')
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle the webhook events
  const eventType = evt.type

  console.log(`Webhook received: ${eventType}`)

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data
    const email = email_addresses[0]?.email_address

    if (!email) {
      console.error('No email provided in user.created webhook')
      return new Response('No email provided', { status: 400 })
    }

    // Check if user already exists (idempotency)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: id },
    })

    if (existingUser) {
      console.log(`User already exists: ${id}`)
      return new Response('User already exists', { status: 200 })
    }

    // Create user without tenant (onboarding will create tenant later)
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email,
        // tenantId is null - will be set during onboarding
        // onboardingComplete defaults to false
      },
    })

    console.log(`User created in database: ${id}, email: ${email}`)
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
      select: { id: true, tenantId: true },
    })

    if (user) {
      // If user has a tenant, delete it (cascades all related data)
      if (user.tenantId) {
        await prisma.tenant.delete({
          where: { id: user.tenantId },
        })
        console.log(`Tenant deleted for user: ${id}`)
      }

      // Delete the user record
      await prisma.user.delete({
        where: { id: user.id },
      })

      console.log(`User deleted from database: ${id}`)
    } else {
      console.log(`User not found in database: ${id}`)
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
