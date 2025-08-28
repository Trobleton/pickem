import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const getCurrentLeaderboard = query({
  handler: async (ctx) => {
    const event = await ctx.db.query("events").order("desc").first();
    if (!event) return null;

    const leaderboard = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("eventId"), event._id))
      .take(50);

    return Promise.all(
      leaderboard.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          ...entry,
          user,
        };
      }),
    );
  },
});

export const createLeaderboard = mutation({
  args: {
    eventId: v.id("events"),
    results: v.array(
      v.object({ userId: v.id("users"), score: v.number(), rank: v.number() }),
    ),
  },
  handler: async (ctx, args) => {
    for (const result of args.results) {
      await ctx.db.insert("leaderboard", {
        eventId: args.eventId,
        rank: result.rank,
        userId: result.userId,
        score: result.score,
      });
    }
  },
});

export const getLeaderboardByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .take(50);

    return leaderboard;
  },
});
