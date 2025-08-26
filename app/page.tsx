import Competitions from "@/components/competitions";
import Leaderboard from "@/components/leaderboard";
import { api } from "@/convex/_generated/api";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { preloadQuery } from "convex/nextjs";

export default async function Home() {
  const preloadEvent = await preloadQuery(api.events.getCurrentEvent);
  const preloadLeaderboard = await preloadQuery(
    api.leaderboard.getCurrentLeaderboard,
  );

  return (
    <div className="p-4 space-y-4">
      <Competitions preloadEvent={preloadEvent} />
      <Leaderboard
        preloadLeaderboard={preloadLeaderboard}
        preloadedEvent={preloadEvent}
      />
    </div>
  );
}
