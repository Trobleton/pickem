'use client'

import { Preloaded, usePreloadedQuery } from "convex/react"
import { Card } from "./ui/card"
import { api } from "@/convex/_generated/api"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"
import Link from "next/link"
import { Button } from "./ui/button"

type TEvent = {
    _id: string
    name: string
    status: string
    eventId: number
}

export default function Competitions({ preloadEvent }: { preloadEvent: Preloaded<typeof api.events.getCurrentEvent> }) {
    const event = usePreloadedQuery(preloadEvent)

    if (!event) return null

    if (event.status === 'open') {
        return (
            <div>
                <Button asChild>
                    <Link href="/events">
                        Lock In
                    </Link>
                </Button>
            </div >
        )
    }

    return (
        <div>{event.name} is currently {event.status}</div>
    )
}