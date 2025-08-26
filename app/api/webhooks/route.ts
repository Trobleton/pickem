import { api } from '@/convex/_generated/api'
import { mutation } from '@/convex/_generated/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { fetchMutation } from 'convex/nextjs'

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)

        // Do something with payload
        // For this guide, log payload to console
        const { id } = evt.data
        const eventType = evt.type
        console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
        console.log('Webhook payload:', evt.data)

        switch (eventType) {
            case 'user.created':
                // check if user exists

                await fetchMutation(api.users.createUser, {
                    clerkId: evt.data.id,
                    username: evt.data.username || '',
                    displayName: evt.data.first_name || '',
                    photo: evt.data.has_image ? evt.data.image_url : '',
                })
                break
            case 'user.updated':
                // update user in db
                break
            case 'user.deleted':
                // delete user from db
                break
            default:
                break
        }

        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}