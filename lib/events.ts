import { TEventResponse } from "@/types/events";

type CalculateParams = {
  picks: number[];
  results: TEventResponse["participants"];
};

export function calculateRankingScore({ picks, results }: CalculateParams) {
  let score = 0;

  // Calculate 4 points per correct ranking
  results.forEach(({ contestant_id, ranking }) => {
    const pickRank = picks.indexOf(contestant_id) + 1;
    if (pickRank === ranking) {
      score += 4;
    }
  });

  return score;
}

export function calculateBracketScore({ picks, results }: CalculateParams) {
  let score = 0;

  // Calculate 2 points for each pick in the top 30 that is actually in the top 30
  const top30Results = results
    .filter(({ ranking }) => ranking <= 30)
    .map(({ contestant_id }) => contestant_id);
  const top30Picks = picks.slice(0, 30);

  top30Picks.forEach((pick) => {
    if (top30Results.includes(pick)) {
      score += 2;
    }
  });

  return score;
}

export function calculateTopFiveScore({ picks, results }: CalculateParams) {
  let score = 0;

  // Calculate 5 points per correct pick in the top 5
  const topFiveResults = results
    .filter(({ ranking }) => ranking <= 5)
    .map(({ contestant_id }) => contestant_id);
  const topFivePicks = picks.slice(0, 5);

  topFivePicks.forEach((pick) => {
    if (topFiveResults.includes(pick)) {
      score += 5;
    }
  });

  return score;
}

export function getCorrectRankingParticipants({
  picks,
  results,
}: CalculateParams) {
  return results
    .filter(
      ({ contestant_id, ranking }) =>
        picks.indexOf(contestant_id) + 1 === ranking,
    )
    .map(({ contestant_id }) => contestant_id);
}

export function getCorrectBracketParticipants({
  picks,
  results,
}: CalculateParams) {
  const top30Results = results
    .filter(({ ranking }) => ranking <= 30)
    .map(({ contestant_id }) => contestant_id);
  const top30Picks = picks.slice(0, 30);

  return top30Picks.filter((pick) => top30Results.includes(pick));
}

export function getCorrectTopFiveParticipants({
  picks,
  results,
}: CalculateParams) {
  const topFiveResults = results
    .filter(({ ranking }) => ranking <= 5)
    .map(({ contestant_id }) => contestant_id);
  const topFivePicks = picks.slice(0, 5);

  return topFivePicks.filter((pick) => topFiveResults.includes(pick));
}
