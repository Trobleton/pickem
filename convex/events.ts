import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { TEventResponse } from "@/types/events";

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

export const getEventMostPopularPick = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    const event = args.eventId
      ? await ctx.db.get(args.eventId)
      : await ctx.db.query("events").order("desc").first();

    if (!event || !event.results) {
      return null;
    }

    const picks = await ctx.db
      .query("picks")
      .filter((q) => q.eq(q.field("eventId"), event._id))
      .collect();

    if (picks.length === 0) {
      return null;
    }

    // Count frequency of first place picks (index 0)
    const firstPlacePickCounts = new Map<number, number>();

    picks.forEach((pick) => {
      if (pick.picks.length > 0) {
        const firstPlaceContestantId = pick.picks[0];
        firstPlacePickCounts.set(
          firstPlaceContestantId,
          (firstPlacePickCounts.get(firstPlaceContestantId) || 0) + 1,
        );
      }
    });

    // Sort by pick count and get top 3
    const sortedPicks = Array.from(firstPlacePickCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (sortedPicks.length === 0) {
      return null;
    }

    // Parse event results to find the participant objects
    const eventResults = JSON.parse(event.results);

    const top3Picks = sortedPicks.map(([contestantId, pickCount]) => {
      const participant = eventResults.participants.find(
        (p: { contestant_id: number }) => p.contestant_id === contestantId,
      );

      return {
        participant,
        pickCount,
        percentage: Math.round((pickCount / picks.length) * 100),
      };
    });

    return {
      top3Picks,
      totalPicks: picks.length,
    };
  },
});

export const getEventParticipantWinner = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    const event = args.eventId
      ? await ctx.db.get(args.eventId)
      : await ctx.db.query("events").order("desc").first();

    if (!event || !event.results) {
      return null;
    }

    // Parse event results to find participants and sort them by their scores
    const eventResults: TEventResponse = JSON.parse(event.results);

    if (
      !eventResults.participants ||
      !Array.isArray(eventResults.participants)
    ) {
      return null;
    }

    return eventResults.participants.find((p) => p.ranking === 1);
  },
});
