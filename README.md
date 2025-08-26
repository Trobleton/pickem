## Getting Started

### Clerk Webhooks

We utilize Clerk for OAuth. To Insert, Update and Delete users from our Convex DB we need to expose the localhost to clerk via [ngrok](https://clerk.com/docs/webhooks/sync-data#set-up-ngrok).

```
ngrok http --url=patient-donkey-friendly.ngrok-free.app 3000
```

## Ranking

4 point per correct ranking (theoretical 160 points)
2 point per correct bracket (mute in right group) (theoretical 80 points)
5 point per correct top 5 (theoretical max 25)

How many people are making it through each round for the Mute Comp?
First Round - Introductions (top 30) 30-11 [19]
Second Round - Talent Show (top 10 make it through) 10-2
Third Round - Judge Prompts (top 2 make it through) 2
Finale (lipsync for your life) (winner picked) 1