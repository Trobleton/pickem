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
import {
  calculateBracketScore,
  calculateRankingScore,
  calculateTopFiveScore,
} from "@/lib/events";
import { TEventResponse } from "@/types/events";
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

  function getUserScore(picks: number[], results: string) {
    const resultsJson: TEventResponse = JSON.parse(results);
    const { participants } = resultsJson;

    const rankingScore = calculateRankingScore({
      picks,
      results: participants,
    });
    const bracketScore = calculateBracketScore({
      picks,
      results: participants,
    });
    const topFiveScore = calculateTopFiveScore({
      picks,
      results: participants,
    });

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
                        <Textarea className="max-h-[400px]" {...field} />
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
