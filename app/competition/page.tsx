import Pickem from "@/components/pickem";
import { TParticipant } from "@/types/competiton";
import { currentUser } from "@clerk/nextjs/server";


export default async function CompetitionPage() {
    const user = await currentUser()

    const url = new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const res = await fetch(`${url}/api/competition`);
    const data: {
        success: boolean
        event_id: number
        round_id: number
        count: number
        participants: TParticipant[]
    } = await res.json();

    return (
        <div className="p-4 space-y-4">
            <h1 className="font-sans text-4xl font-medium">Mute Competition Aug 2025</h1>
            <Pickem data={data.participants} />
        </div>
    )
}
