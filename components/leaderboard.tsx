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
import { InfoIcon, MedalIcon } from "lucide-react";
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
import { TEventParticipant, TEventResponse } from "@/types/events";
import {
  calculateBracketScore,
  calculateRankingScore,
  calculateTopFiveScore,
  getCorrectRankingParticipants,
  getCorrectBracketParticipants,
  getCorrectTopFiveParticipants,
} from "@/lib/events";
import NumberFlow from "@number-flow/react";
import { useEffect, useState, useMemo, useRef } from "react";
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
}: {
  userId: Id<"users">;
  results: string;
  score: number;
}) {
  const picks = useQuery(api.picks.getPicksByUserId, { userId });
  const eventResults: TEventResponse = JSON.parse(results);
  const { participants } = eventResults;

  const [bracketScore, setBracketScore] = useState(0);
  const [rankingScore, setRankingScore] = useState(0);
  const [topFiveScore, setTopFiveScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(
    null,
  );
  const [showFinalRanks, setShowFinalRanks] = useState(false);
  const hasInitialized = useRef(false);

  const scoringData = useMemo(() => {
    if (!picks) {
      return {
        correctRankingIds: [],
        correctBracketIds: [],
        correctTopFiveIds: [],
      };
    }

    const picksData = { picks: picks.picks, results: participants };

    return {
      correctRankingIds: getCorrectRankingParticipants(picksData),
      correctBracketIds: getCorrectBracketParticipants(picksData),
      correctTopFiveIds: getCorrectTopFiveParticipants(picksData),
    };
  }, [picks, participants]);

  useEffect(() => {
    if (picks && !hasInitialized.current) {
      const picksData = { picks: picks.picks, results: participants };

      setBracketScore(calculateBracketScore(picksData));
      setRankingScore(calculateRankingScore(picksData));
      setTopFiveScore(calculateTopFiveScore(picksData));
      setTotalScore(score);

      hasInitialized.current = true;
    }
  }, [picks, participants, score]);

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
      <div className="grid grid-cols-3 md:grid-cols-4 max-w-4xl mx-auto gap-4">
        <Card
          className={cn(
            "p-2 gap-0 cursor-pointer",
            highlightedCategory === "bracket" && "outline outline-green-500",
          )}
          onClick={() =>
            setHighlightedCategory((prev) =>
              prev === "bracket" ? null : "bracket",
            )
          }
        >
          <CardHeader className="px-2 text-center text-sm md:text-base">
            Bracket (+2)
          </CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono text-green-500">
            <NumberFlow value={bracketScore} trend={0} animated />
          </CardContent>
        </Card>

        <Card
          className={cn(
            "p-2 gap-0 cursor-pointer",
            highlightedCategory === "ranking" && "outline outline-blue-500",
          )}
          onClick={() =>
            setHighlightedCategory((prev) =>
              prev === "ranking" ? null : "ranking",
            )
          }
        >
          <CardHeader className="px-2 text-center text-sm md:text-base">
            Ranking (+4)
          </CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono text-blue-500">
            <NumberFlow value={rankingScore} trend={0} animated />
          </CardContent>
        </Card>

        <Card
          className={cn(
            "p-2 gap-0 cursor-pointer",
            highlightedCategory === "topFive" && "outline outline-purple-500",
          )}
          onClick={() =>
            setHighlightedCategory((prev) =>
              prev === "topFive" ? null : "topFive",
            )
          }
        >
          <CardHeader className="px-2 text-center text-sm md:text-base">
            Top 5 (+5)
          </CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono text-purple-500">
            <NumberFlow value={topFiveScore} trend={0} animated />
          </CardContent>
        </Card>

        <Card className="p-2 gap-0 col-span-3 md:col-span-1">
          <CardHeader className="px-2 text-center text-sm md:text-base">
            Total
          </CardHeader>
          <CardContent className="px-2 text-center text-3xl font-mono">
            <NumberFlow value={totalScore} trend={0} animated />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFinalRanks(!showFinalRanks)}
          className="text-xs"
        >
          {showFinalRanks ? "Show My Rankings" : "Show Final Rankings"}
        </Button>
      </div>

      <div
        className="grid grid-cols-4 lg:max-w-4xl mx-auto gap-4 sm:max-h-[25vh] md:max-h-[40vh] overflow-y-scroll lg:overflow-x-hidden overflow-x-scroll mask-b-from-80% pb-12 px-0.5 pt-0.5 min-w-0"
        style={{ gridTemplateColumns: "repeat(4, minmax(200px, 1fr))" }}
      >
        {Object.entries(picksByRound)
          .reverse()
          .map(([round, picks]) => (
            <LeaderboardUserPicksRound
              key={round}
              picksByRound={picks}
              highlightedCategory={highlightedCategory}
              correctRankingIds={scoringData.correctRankingIds}
              correctBracketIds={scoringData.correctBracketIds}
              correctTopFiveIds={scoringData.correctTopFiveIds}
              showFinalRanks={showFinalRanks}
            />
          ))}
      </div>
    </div>
  );
}

function LeaderboardUserPicksRound({
  picksByRound,
  highlightedCategory,
  correctRankingIds,
  correctBracketIds,
  correctTopFiveIds,
  showFinalRanks,
}: {
  picksByRound: { participant: TEventParticipant | undefined; rank: number }[];
  highlightedCategory: string | null;
  correctRankingIds: number[];
  correctBracketIds: number[];
  correctTopFiveIds: number[];
  showFinalRanks: boolean;
}) {
  const roundPicks = picksByRound || [];
  return (
    <div className="flex flex-col gap-2">
      {roundPicks.map(({ participant, rank }, index) => {
        const participantId = participant?.contestant_id;
        const earnedRanking =
          !!participantId && correctRankingIds.includes(participantId);
        const earnedBracket =
          !!participantId && correctBracketIds.includes(participantId);
        const earnedTopFive =
          !!participantId && correctTopFiveIds.includes(participantId);

        return (
          <div
            key={index}
            className={cn(
              "rounded-md outline-offset-1",
              highlightedCategory === "bracket" &&
                earnedBracket &&
                "outline outline-green-500",
              highlightedCategory === "ranking" &&
                earnedRanking &&
                "outline outline-blue-500",
              highlightedCategory === "topFive" &&
                earnedTopFive &&
                "outline outline-purple-500",
            )}
          >
            <LeaderboardUserPicksRoundItem
              participant={participant}
              userRank={rank}
              earnedRanking={earnedRanking}
              earnedBracket={earnedBracket}
              earnedTopFive={earnedTopFive}
              showFinalRanks={showFinalRanks}
            />
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardUserPicksRoundItem({
  participant,
  userRank,
  earnedRanking,
  earnedBracket,
  earnedTopFive,
  showFinalRanks,
}: {
  participant?: TEventParticipant;
  userRank: number;
  earnedRanking?: boolean;
  earnedBracket?: boolean;
  earnedTopFive?: boolean;
  showFinalRanks?: boolean;
}) {
  const displayRank = showFinalRanks
    ? (participant?.ranking ?? userRank)
    : userRank;

  if (!participant) {
    return (
      <div className="flex flex-row items-center gap-4 h-auto md:h-8 min-h-8 py-1 md:py-0 bg-neutral-900 rounded-md border border-red-900">
        <span className="font-mono w-6 pl-2">{displayRank}</span>
        <span className="line-through text-sm truncate">Dropped Out</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-row items-center gap-4 overflow-hidden h-auto md:h-8 min-h-8 py-1 md:py-0 bg-neutral-900 rounded-md border border-neutral-700">
      <span className="font-mono w-6 pl-2">
        <NumberFlow value={displayRank} animated trend={0} />
      </span>
      <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
        <div className="truncate text-sm">{participant.display_name}</div>
        <div className="flex gap-1">
          {earnedRanking && (
            <div
              className="w-2 h-2 bg-blue-500 rounded-full"
              title="Earned ranking points"
            />
          )}
          {earnedBracket && (
            <div
              className="w-2 h-2 bg-green-500 rounded-full"
              title="Earned bracket points"
            />
          )}
          {earnedTopFive && (
            <div
              className="w-2 h-2 bg-purple-500 rounded-full"
              title="Earned top 5 points"
            />
          )}
        </div>
      </div>
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
