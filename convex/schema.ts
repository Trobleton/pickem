import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    leaderboard: defineTable({
        eventId: v.string(),
        userId: v.id('users'),
        score: v.number(),
        rank: v.number(),
    }),
    picks: defineTable({
        userId: v.id('users'),
        eventId: v.string(),
        picks: v.array(v.string()),
    }),
    users: defineTable({
        username: v.string(),
        displayName: v.string(),
        photo: v.string(),
    })
})