import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const getEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    return events;
  },
});

export const getCurrentEvent = query({
  handler: async (ctx) => {
    const event = await ctx.db.query("events").order("desc").first();
    return event;
  },
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return event;
  },
});

export const getEventData = action({
  args: { blobId: v.id("_storage") },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.blobId);

    if (!blob) {
      return null;
    }

    return new Response(blob);
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    status: v.string(),
    results: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...rest } = args;
    await ctx.db.patch(eventId, { ...rest });
  },
});
