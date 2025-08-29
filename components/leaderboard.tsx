"use client";

import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
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
import { InfoIcon, MedalIcon, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Id } from "@/convex/_generated/dataModel";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { TParticipant } from "@/types/competiton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { TEventParticipant, TEventResponse } from "@/types/events";
import {
  calculateBracketScore,
  calculateRankingScore,
  calculateTopFiveScore,
} from "@/lib/events";
import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import Image from "next/image";

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
            <LeaderboardResults
              leaderboard={leaderboard}
              results={event!.results!}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardResults({
  leaderboard,
  results,
}: {
  leaderboard: FunctionReturnType<typeof api.leaderboard.getCurrentLeaderboard>;
  results: string;
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
              <Drawer key={result._id}>
                <DrawerTrigger asChild>
                  <TableRow
                    className={cn(
                      isCurrentUser &&
                        "bg-purple-700/20 hover:bg-purple-700/50",
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
                </DrawerTrigger>
                <DrawerContent className="min-h-3/4 px-4 focus-visible:outline-none">
                  <DrawerHeader>
                    <DrawerTitle className="text-2xl">
                      {result.user!.displayName}
                    </DrawerTitle>
                    <DrawerDescription>Rank: {result.rank}</DrawerDescription>
                  </DrawerHeader>

                  <LeaderboardUserPicks
                    userId={result.userId}
                    results={results}
                    score={result.score}
                    rank={result.rank}
                  />
                </DrawerContent>
              </Drawer>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function LeaderboardUserPicks({
  userId,
  results,
  score,
  rank,
}: {
  userId: Id<"users">;
  results: string;
  score: number;
  rank: number;
}) {
  const picks = useQuery(api.picks.getPicksByUserId, { userId });
  const eventResults: TEventResponse = JSON.parse(results);
  const { participants } = eventResults;

  const [bracketScore, setBracketScore] = useState(0);
  const [rankingScore, setRankingScore] = useState(0);
  const [topFiveScore, setTopFiveScore] = useState(0);
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    if (picks) {
      setBracketScore(
        calculateBracketScore({
          picks: picks.picks,
          results: participants,
        }),
      );
      setRankingScore(
        calculateRankingScore({
          picks: picks.picks,
          results: participants,
        }),
      );
      setTopFiveScore(
        calculateTopFiveScore({
          picks: picks.picks,
          results: participants,
        }),
      );
      setUserScore(score);
    }
  }, [picks, participants]);

  if (typeof picks === "undefined") {
    return <p>loading...</p>;
  }

  if (!picks) return null;

  const picksByRound = picks.picks.reduce(
    (
      groups: Record<
        number,
        { participant: TEventParticipant | undefined; rank: number }[]
      >,
      pick: (typeof picks)["picks"][number],
      index: number,
    ) => {
      const participant: TEventParticipant | undefined =
        eventResults.participants.find(
          (p: { contestant_id: number }) => p.contestant_id === pick,
        );

      const rank = index + 1; // User's ranking for the participant

      // Allow undefined for participants that dropped out
      if (index === 0) {
        groups[1] = [{ participant, rank }];
      } else if (index === 1) {
        groups[2] = [{ participant, rank }];
      } else if (index >= 2 && index < 10) {
        groups[3] = [...(groups[3] || []), { participant, rank }];
      } else {
        groups[4] = [...(groups[4] || []), { participant, rank }];
      }
      return groups;
    },
    {} as Record<
      number,
      { participant: TEventParticipant | undefined; rank: number }[]
    >,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 max-w-4xl mx-auto gap-4">
        <Card className="p-2 gap-0">
          <CardHeader className="px-2 text-center">Bracket</CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono">
            <NumberFlow value={bracketScore} trend={0} animated />
          </CardContent>
        </Card>

        <Card className="p-2 gap-0">
          <CardHeader className="px-2 text-center">Ranking</CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono">
            <NumberFlow value={rankingScore} trend={0} animated />
          </CardContent>
        </Card>

        <Card className="p-2 gap-0">
          <CardHeader className="px-2 text-center">Top 5</CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono">
            <NumberFlow value={topFiveScore} trend={0} animated />
          </CardContent>
        </Card>

        <Card className="p-2 gap-0">
          <CardHeader className="px-2 text-center">Total</CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono">
            <NumberFlow value={userScore} trend={0} animated />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-4 max-w-4xl mx-auto gap-4 max-h-[400px] overflow-y-scroll">
        {Object.entries(picksByRound)
          .reverse()
          .map(([round, picks]) => (
            <LeaderboardUserPicksRound key={round} picksByRound={picks} />
          ))}
      </div>
    </div>
  );
}

function LeaderboardUserPicksRound({
  picksByRound,
}: {
  picksByRound: { participant: TEventParticipant | undefined; rank: number }[];
}) {
  const roundPicks = picksByRound || [];
  return (
    <div className="flex flex-col gap-2">
      {roundPicks.map(({ participant, rank }, index) => (
        <div key={index}>
          <LeaderboardUserPicksRoundItem
            participant={participant}
            userRank={rank}
          />
        </div>
      ))}
    </div>
  );
}

function LeaderboardUserPicksRoundItem({
  participant,
  userRank,
}: {
  participant?: TEventParticipant;
  userRank: number;
}) {
  if (!participant) {
    return (
      <div className="flex flex-row items-center gap-4 h-8 bg-neutral-900 rounded-md">
        <span className="font-mono w-6 pl-2">{userRank}</span>
        <span className="line-through">Dropped Out</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-row items-center gap-4 overflow-hidden h-8 bg-neutral-900 rounded-md border border-neutral-700">
      <span className="font-mono w-6 pl-2">{userRank}</span>
      {participant.display_name}
      <Image
        src={participant?.tierlist_image ?? ""}
        alt={participant?.display_name ?? ""}
        width={48}
        height={48}
        className="absolute right-0 top-0 mask-l-from-25%"
      />
    </div>
  );
}
