import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const lockIn = mutation({
    args: {
        userId: v.id('users'),
        eventId: v.id('events'),
        picks: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        // verify the user does not already have locked in picks for this event
        const existingPicks = await ctx.db.query("picks").filter(q => q.eq(q.field('userId'), args.userId)).filter(q => q.eq(q.field('eventId'), args.eventId)).first()

        if (existingPicks) {
            return { success: false, message: 'User has already locked in picks for this event' }
        }

        await ctx.db.insert("picks", {
            userId: args.userId,
            eventId: args.eventId,
            picks: args.picks,
        })

        return { success: true }
    }
})

export const getCurrentEventPicks = query({
    args: {
        clerkId: v.string(),
        eventId: v.id('events'),
    },
    handler: async (ctx, args) => {
        const currentUser = await ctx.db.query("users").filter(q => q.eq(q.field('clerkId'), args.clerkId)).first()
        const currentEvent = await ctx.db.get(args.eventId)

        if (!currentUser || !currentEvent) {
            return null
        }

        return ctx.db.query("picks").filter(q => q.eq(q.field('userId'), currentUser._id)).filter(q => q.eq(q.field('eventId'), currentEvent._id)).first()
    }
})