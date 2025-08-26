import { Pickem } from "@/components/pickem";
import { TParticipant } from "@/types/competiton";
import { currentUser } from "@clerk/nextjs/server";


export default async function CompetitionPage() {
    const user = await currentUser()

    const res = await fetch(`${process.env.VERCEL_URL}/api/competition`);
    const data: {
        success: boolean
        event_id: number
        round_id: number
        count: number
        participants: TParticipant[]
    } = await res.json();

    return (
        <div>
            <h1>Competition</h1>
            <Pickem data={data.participants} />
        </div>
    )
}
