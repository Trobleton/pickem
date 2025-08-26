export type TParticipant = {
    contestant_id: number
    display_name: string
    ranking: number
    rounds_count: number
    tierlist_image: string
    total_score: number
    twitch_user_name: string
}

export type TCompetition = TParticipant[] | []