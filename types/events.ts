export type TEventParticipant = {
  contestant_id: number;
  twitch_username: string;
  display_name: string;
  tierlist_image: string;
  total_score: number; // final score
  ranking: number; // final rank
  rounds_count: number; // rounds contestant participated in
};

export type TEventResponse = {
  success: boolean;
  event_id: number;
  round_id: number;
  count: number;
  participants: TEventParticipant[];
};
