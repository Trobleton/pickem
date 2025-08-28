import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    eventId: v.number(),
    name: v.string(),
    status: v.string(),
    results: v.optional(v.string()),
  }),
  leaderboard: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    score: v.number(),
    rank: v.number(),
  }),
  picks: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    picks: v.array(v.number()),
  }).index("userId_eventId", ["userId", "eventId"]),
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    photo: v.string(),
  }).index("clerkId", ["clerkId"]),
});
