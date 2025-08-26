import Pickem from "@/components/pickem";
import { api } from "@/convex/_generated/api";
import { TParticipant } from "@/types/competiton";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";


export default async function CompetitionPage() {
    const url = `${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}${process.env.VERCEL_PROJECT_PRODUCTION_URL}`

    const res = await fetch(`${url}/api/competition`);
    const data: {
        success: boolean
        event_id: number
        round_id: number
        count: number
        participants: TParticipant[]
    } = await res.json();

    const user = await currentUser()!
    const currentEvent = await fetchQuery(api.events.getCurrentEvent);

    if (!currentEvent || !user) {
        redirect('/')
        return null
    }

    const preloadedPicks = await preloadQuery(api.picks.getCurrentEventPicks, { clerkId: user.id, eventId: currentEvent._id });

    return (
        <div className="p-4 space-y-4 max-w-6xl mx-auto">
            <h1 className="font-sans text-4xl font-medium text-center">{currentEvent.name}</h1>
            <Pickem data={data.participants} preloadedPicks={preloadedPicks} />
        </div>
    )
}
