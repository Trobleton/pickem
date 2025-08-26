"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { Card } from "./ui/card";
import { api } from "@/convex/_generated/api";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import Link from "next/link";
import { Button } from "./ui/button";
import TwitchIcon from "./icons/twitch";
import { MedalIcon } from "lucide-react";

type TEvent = {
  _id: string;
  name: string;
  status: string;
  eventId: number;
};

export default function Competitions({
  preloadEvent,
}: {
  preloadEvent: Preloaded<typeof api.events.getCurrentEvent>;
}) {
  const event = usePreloadedQuery(preloadEvent);

  if (!event) return null;

  if (event.status === "closed") {
    return (
      <div className="flex flex-col gap-4 items-center">
        <span className="text-2xl font-bold">
          {event.name} is currently live!
        </span>
        <Button variant="twitch" className="w-fit" asChild>
          <Link
            href="https://twitch.tv/roflgator"
            target="_blank"
            rel="noreferrer nofollower"
            className="flex flex-row gap-2 items-center"
          >
            <TwitchIcon />
            Watch Stream
          </Link>
        </Button>
      </div>
    );
  }

  if (event.status === "open") {
    return (
      <div className="flex flex-col gap-4 items-center">
        <Button size="lg" asChild>
          <Link href="/events">
            <MedalIcon />
            Make Your Picks
          </Link>
        </Button>
      </div>
    );
  }

  return null;
}

