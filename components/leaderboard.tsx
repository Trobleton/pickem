"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { MedalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <Card
        className={cn(
          "border-purple-800 min-h-32",
          !leaderboard && "mask-b-from-25%",
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Leaderboard</CardTitle>
          <CardDescription>{event?.name}</CardDescription>
        </CardHeader>

        <CardContent>
          {typeof leaderboard === "undefined" ? (
            <p></p>
          ) : (
            <LeaderboardResults leaderboard={leaderboard} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardResults({
  leaderboard,
}: {
  leaderboard: FunctionReturnType<typeof api.leaderboard.getCurrentLeaderboard>;
}) {
  if (!leaderboard) return null;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((result) => (
            <TableRow key={result._id}>
              <TableCell className="font-mono flex flex-row items-center gap-4">
                {result.rank}
                {result.rank <= 3 ? (
                  <MedalIcon
                    size={14}
                    className={cn(
                      result.rank === 1 && "text-orange-400",
                      result.rank === 2 && "text-gray-400",
                      result.rank === 3 && "text-yellow-800",
                    )}
                  />
                ) : null}
              </TableCell>
              <TableCell>{result.user!.displayName}</TableCell>
              <TableCell>{result.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
