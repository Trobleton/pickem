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
import { InfoIcon, MedalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

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
          "border-purple-800 min-h-32 relative",
          !leaderboard && "mask-b-from-25%",
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Leaderboard</CardTitle>
          <CardDescription>{event?.name}</CardDescription>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-fit p-2 absolute top-4 right-4"
                title="Leaderboard Scoring Info"
              >
                <InfoIcon size={14} />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leaderboard Scoring</DialogTitle>

                <div className="text-sm space-y-2">
                  <p>A perfect pick would total 205 points.</p>
                  <ul className="list-disc list-inside">
                    <li>
                      <strong>4 points</strong> per correct ranking (120 points)
                    </li>
                    <li>
                      <strong>2 points</strong> per correct bracket (60 points)
                    </li>
                    <li>
                      <strong>5 points</strong> per correct top 5 (25 points)
                    </li>
                  </ul>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
  const user = useUser();
  if (!leaderboard) return null;

  return (
    <div className="relative max-h-[400px] overflow-y-scroll">
      <Table>
        <TableHeader className="sticky top-0">
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((result) => {
            const isCurrentUser =
              user.user && user.user.username === result.user!.username;

            return (
              <TableRow
                key={result._id}
                className={cn(
                  isCurrentUser && "bg-purple-700/20 hover:bg-purple-700/50",
                )}
              >
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
                <TableCell className={cn(isCurrentUser && "font-bold")}>
                  {result.user!.displayName}
                </TableCell>
                <TableCell>{result.score}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
