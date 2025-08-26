import { query } from "./_generated/server";

export const getEvents = query({
    handler: async (ctx) => {
        const events = await ctx.db.query("events").collect();
        return events
    }
})

export const getCurrentEvent = query({
    handler: async (ctx) => {
        const event = await ctx.db.query("events").order('desc').first();
        return event
    }
})