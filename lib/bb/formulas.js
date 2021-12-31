import { CONSTANTS } from "/lib/bb/constants.js";
import { getBitNodeMultipliers } from "/lib/bb/bitnode.js";

export function numCycleForGrowth(ns, server, growth, p, cores = 1) {
  let ajdGrowthRate = 1 + (CONSTANTS.ServerBaseGrowthRate - 1) / server.hackDifficulty;
  if (ajdGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
    ajdGrowthRate = CONSTANTS.ServerMaxGrowthRate;
  }

  const serverGrowthPercentage = server.serverGrowth / 100;

  const coreBonus = 1 + (cores - 1) / 16;
  const cycles =
    Math.log(growth) /
    (Math.log(ajdGrowthRate) *
     p.hacking_grow_mult *
     serverGrowthPercentage *
     getBitNodeMultipliers(ns).ServerGrowthRate *
     coreBonus);

  return cycles;
}

export function calculateIntelligenceBonus(intelligence, weight = 1) {
  return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}

export function calculateServerGrowth(ns, server, threads, p, cores = 1) {
  const numServerGrowthCycles = Math.max(Math.floor(threads), 0);

  //Get adjusted growth rate, which accounts for server security
  const growthRate = CONSTANTS.ServerBaseGrowthRate;
  let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
  if (adjGrowthRate > CONSTANTS.ServerMaxGrowthRate) {
    adjGrowthRate = CONSTANTS.ServerMaxGrowthRate;
  }

  //Calculate adjusted server growth rate based on parameters
  const serverGrowthPercentage = server.serverGrowth / 100;
  const numServerGrowthCyclesAdjusted =
        numServerGrowthCycles * serverGrowthPercentage * getBitNodeMultipliers(ns).ServerGrowthRate;

  //Apply serverGrowth for the calculated number of growth cycles
  const coreBonus = 1 + (cores - 1) / 16;
  return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * p.hacking_grow_mult * coreBonus);
}

export function calculatePercentMoneyHacked(ns, server, player) {
  // Adjust if needed for balancing. This is the divisor for the final calculation
  const balanceFactor = 240;

  const difficultyMult = (100 - server.hackDifficulty) / 100;
  const skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking;
  const percentMoneyHacked = (difficultyMult * skillMult * player.hacking_money_mult) / balanceFactor;
  if (percentMoneyHacked < 0) {
    return 0;
  }
  if (percentMoneyHacked > 1) {
    return 1;
  }

  return percentMoneyHacked * getBitNodeMultipliers(ns).ScriptHackMoney;
}

export function calculateHackingChance(_ns, server, player) {
  const hackFactor = 1.75;
  const difficultyMult = (100 - server.hackDifficulty) / 100;
  const skillMult = hackFactor * player.hacking;
  const skillChance = (skillMult - server.requiredHackingSkill) / skillMult;
  const chance =
    skillChance * difficultyMult * player.hacking_chance_mult * calculateIntelligenceBonus(player.intelligence, 1);
  if (chance > 1) {
    return 1;
  }
  if (chance < 0) {
    return 0;
  }

  return chance;
}

export function calculateHackingTime(_ns, server, player) {
  const difficultyMult = server.requiredHackingSkill * server.hackDifficulty;

  const baseDiff = 500;
  const baseSkill = 50;
  const diffFactor = 2.5;
  let skillFactor = diffFactor * difficultyMult + baseDiff;
  // tslint:disable-next-line
  skillFactor /= player.hacking + baseSkill;

  const hackTimeMultiplier = 5;
  const hackingTime =
    (hackTimeMultiplier * skillFactor) /
    (player.hacking_speed_mult * calculateIntelligenceBonus(player.intelligence, 1));

  return hackingTime;
}
