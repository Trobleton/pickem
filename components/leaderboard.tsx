"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { api } from "@/convex/_generated/api";

type TLeaderboardItem = {
  _id: string;
  userId: string;
  eventId: string;
  score: number;
  rank: number;
};

export default function Leaderboard({
  preloadLeaderboard,
  preloadedEvent,
}: {
  preloadLeaderboard: Preloaded<typeof api.leaderboard.getCurrentLeaderboard>;
  preloadedEvent: Preloaded<typeof api.events.getCurrentEvent>;
}) {
  const event = usePreloadedQuery(preloadedEvent);
  const leaderboard = usePreloadedQuery(preloadLeaderboard);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-purple-800 mask-b-from-50% min-h-32">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Leaderboard</CardTitle>
          <CardDescription>{event?.name}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

