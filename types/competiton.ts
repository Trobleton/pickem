export type TParticipant = {
    user_id: number
    display_name: string
    twitch_user_name: string
    twitch_user_id: number
    tierlist_image: string
    ranking: number
}

export type TCompetition = TParticipant[] | []