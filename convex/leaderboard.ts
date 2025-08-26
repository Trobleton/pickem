import { query } from "./_generated/server";

export const getCurrentLeaderboard = query({
    handler: async (ctx) => {
        const event = await ctx.db.query("events").order('desc').first();
        if (!event) return null

        const leaderboard = await ctx.db.query("leaderboard").filter(q => q.eq(q.field('eventId'), event._id)).take(50);
        return leaderboard
    }
})