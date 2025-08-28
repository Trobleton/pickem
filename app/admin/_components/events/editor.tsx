"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";

type Props = {
  data: FunctionReturnType<typeof api.events.getEvents>[number];
};

export default function EventsEditor({ data }: Props) {
  const picks = useQuery(api.picks.getPicksByEventId, { eventId: data._id });
  const leaderboard = useQuery(api.leaderboard.getLeaderboardByEvent, {
    eventId: data._id,
  });
  const createLeaderboard = useMutation(api.leaderboard.createLeaderboard);
  const updateEvent = useMutation(api.events.updateEvent);

  const form = useForm({
    defaultValues: {
      name: data.name,
      results: data.results,
      status: data.status,
    },
  });

  function calculateRankingScore(
    picks: number[],
    resultsJson: { participants: { contestant_id: number; ranking: number }[] },
  ) {
    let score = 0;

    // Calculate 4 points per correct ranking
    resultsJson.participants.forEach(({ contestant_id, ranking }) => {
      const pickRank = picks.indexOf(contestant_id) + 1;
      if (pickRank === ranking) {
        score += 4;
      }
    });

    return score;
  }

  function calculateBracketScore(
    picks: number[],
    resultsJson: { participants: { contestant_id: number; ranking: number }[] },
  ) {
    let score = 0;

    // Calculate 2 points for each pick in the top 30 that is actually in the top 30
    const top30Results = resultsJson.participants
      .filter(({ ranking }) => ranking <= 30)
      .map(({ contestant_id }) => contestant_id);
    const top30Picks = picks.slice(0, 30);

    top30Picks.forEach((pick) => {
      if (top30Results.includes(pick)) {
        score += 2;
      }
    });

    return score;
  }

  function calculateTopFiveScore(
    picks: number[],
    resultsJson: { participants: { contestant_id: number; ranking: number }[] },
  ) {
    let score = 0;

    // Calculate 5 points per correct pick in the top 5
    const topFiveResults = resultsJson.participants
      .filter(({ ranking }) => ranking <= 5)
      .map(({ contestant_id }) => contestant_id);
    const topFivePicks = picks.slice(0, 5);

    topFivePicks.forEach((pick) => {
      if (topFiveResults.includes(pick)) {
        score += 5;
      }
    });

    return score;
  }

  function getUserScore(picks: number[], results: string) {
    const resultsJson: {
      participants: {
        contestant_id: number;
        ranking: number;
        rounds_count: number;
      }[];
    } = JSON.parse(results);

    const rankingScore = calculateRankingScore(picks, resultsJson);
    const bracketScore = calculateBracketScore(picks, resultsJson);
    const topFiveScore = calculateTopFiveScore(picks, resultsJson);

    return rankingScore + bracketScore + topFiveScore;
  }

  async function generateLeaderboard() {
    // need: picks and results
    if (!picks || !data.results) return null;

    const newLeaderboard = picks
      .map((userPick) => {
        const userScore = getUserScore(userPick.picks, data.results!);
        return {
          userId: userPick.userId,
          score: userScore,
        };
      })
      // Sort leaderboard by score in descending order
      .sort((a, b) => b.score - a.score)
      // Add rank to each user
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    createLeaderboard({ eventId: data._id, results: newLeaderboard });
  }

  function handleFormSubmit(values: {
    name: string;
    status: string;
    results?: string;
  }) {
    updateEvent({ eventId: data._id, ...values });
    form.reset();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="text-sm p-2 size-fit">
          <Settings />
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>{data.name}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1"
          >
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="off"
                          aria-autocomplete="none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="results"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Results</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Paste the raw JSON from Jimmy&apos;s results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={generateLeaderboard}
                disabled={!!leaderboard?.length}
              >
                Generate Leaderboard
              </Button>
              <Button disabled={!form.formState.isDirty}>Update</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
