'use client'

import { Preloaded, usePreloadedQuery } from "convex/react"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { api } from "@/convex/_generated/api"

type TLeaderboardItem = {
    _id: string
    userId: string
    eventId: string
    score: number
    rank: number
}

export default function Leaderboard({ preloadLeaderboard, preloadedEvent }: { preloadLeaderboard: Preloaded<typeof api.leaderboard.getCurrentLeaderboard>, preloadedEvent: Preloaded<typeof api.events.getCurrentEvent> }) {
    const event = usePreloadedQuery(preloadedEvent)
    const leaderboard = usePreloadedQuery(preloadLeaderboard)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
        </Card>
    )
}