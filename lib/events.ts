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

  // Bracket scoring: 2 points for each pick in the correct bracket
  // Bracket 4: positions 11-30 (picks 10-29)
  // Bracket 3: positions 3-10 (picks 2-9) 
  // Bracket 2: position 2 (pick 1)
  // Bracket 1: position 1 (pick 0)
  
  picks.forEach((pick, pickIndex) => {
    const participant = results.find(({ contestant_id }) => contestant_id === pick);
    if (!participant) return;
    
    const actualRanking = participant.ranking;
    const pickPosition = pickIndex + 1; // 1-indexed position in user's picks
    
    // Check if pick is in the correct bracket
    let inCorrectBracket = false;
    
    if (pickPosition === 1 && actualRanking === 1) {
      // Bracket 1: 1st place pick should be 1st place
      inCorrectBracket = true;
    } else if (pickPosition === 2 && actualRanking === 2) {
      // Bracket 2: 2nd place pick should be 2nd place
      inCorrectBracket = true;
    } else if (pickPosition >= 3 && pickPosition <= 10 && actualRanking >= 3 && actualRanking <= 10) {
      // Bracket 3: picks 3-10 should be ranked 3-10
      inCorrectBracket = true;
    } else if (pickPosition >= 11 && pickPosition <= 30 && actualRanking >= 11 && actualRanking <= 30) {
      // Bracket 4: picks 11-30 should be ranked 11-30
      inCorrectBracket = true;
    }
    
    if (inCorrectBracket) {
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
  const correctBracketPicks: number[] = [];
  
  picks.forEach((pick, pickIndex) => {
    const participant = results.find(({ contestant_id }) => contestant_id === pick);
    if (!participant) return;
    
    const actualRanking = participant.ranking;
    const pickPosition = pickIndex + 1; // 1-indexed position in user's picks
    
    // Check if pick is in the correct bracket
    let inCorrectBracket = false;
    
    if (pickPosition === 1 && actualRanking === 1) {
      // Bracket 1: 1st place pick should be 1st place
      inCorrectBracket = true;
    } else if (pickPosition === 2 && actualRanking === 2) {
      // Bracket 2: 2nd place pick should be 2nd place
      inCorrectBracket = true;
    } else if (pickPosition >= 3 && pickPosition <= 10 && actualRanking >= 3 && actualRanking <= 10) {
      // Bracket 3: picks 3-10 should be ranked 3-10
      inCorrectBracket = true;
    } else if (pickPosition >= 11 && pickPosition <= 30 && actualRanking >= 11 && actualRanking <= 30) {
      // Bracket 4: picks 11-30 should be ranked 11-30
      inCorrectBracket = true;
    }
    
    if (inCorrectBracket) {
      correctBracketPicks.push(pick);
    }
  });

  return correctBracketPicks;
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
