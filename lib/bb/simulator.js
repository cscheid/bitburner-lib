import {
  calculatePercentMoneyHacked,
  calculateServerGrowth,
  numCycleForGrowth,
} from "/lib/bb/formulas.js";

import { getBitNodeMultipliers } from "/lib/bb/bitnode.js";
import { CONSTANTS } from "/lib/bb/constants.js";

function isValidNumber(n) {
  return typeof n === "number" && !isNaN(n);
}

function fortify(server, amount)
{
  server.hackDifficulty += amount;
  server.hackDifficulty = Math.min(100, Math.max(server.hackDifficulty, server.minDifficulty, 1));
}

export function weaken(ns, { server, host, threads })
{
  const coreBonus = 1 + (host.cpuCores - 1) / 16;
  server.hackDifficulty -= CONSTANTS.ServerWeakenAmount * threads * coreBonus;
  server.hackDifficulty = Math.min(100, Math.max(server.hackDifficulty, server.minDifficulty, 1));
}

export function hack(ns, { server, player, threads })
{
  const percentHacked = calculatePercentMoneyHacked(ns, server, player);
  let maxThreadNeeded = Math.ceil((1 / percentHacked) * (server.moneyAvailable / server.moneyMax));
  if (isNaN(maxThreadNeeded)) {
    // Server has a 'max money' of 0 (probably). We'll set this to an arbitrarily large value
    maxThreadNeeded = 1e6;
  }
  
  let moneyDrained = Math.floor(server.moneyAvailable * percentHacked) * threads;
  
  // let expGainedOnSuccess = calculateHackingExpGain(server, Player) * threads;
  // const expGainedOnFailure = expGainedOnSuccess / 4;
  // Over-the-top safety checks
  if (moneyDrained <= 0) {
    moneyDrained = 0;
    // expGainedOnSuccess = expGainedOnFailure;
  }
  if (moneyDrained > server.moneyAvailable) {
    moneyDrained = server.moneyAvailable;
  }
  server.moneyAvailable -= moneyDrained;
  if (server.moneyAvailable < 0) {
    server.moneyAvailable = 0;
  }
  
  const moneyGained = moneyDrained * getBitNodeMultipliers(ns).ScriptHackMoneyGain;
  fortify(ns, server, Math.min(threads, maxThreadNeeded));

  return moneyGained;
}

export function grow(ns, { server, player, threads, host })
{
  let cores = host.cpuCores;
  let p = player;

  let serverGrowth = calculateServerGrowth(ns, server, threads, p, cores);
  if (serverGrowth < 1) {
    console.warn("serverGrowth calculated to be less than 1");
    serverGrowth = 1;
  }

  const oldMoneyAvailable = server.moneyAvailable;
  server.moneyAvailable += 1 * threads; // It can be grown even if it has no money
  server.moneyAvailable *= serverGrowth;

  // in case of data corruption
  if (isValidNumber(server.moneyMax) && isNaN(server.moneyAvailable)) {
    server.moneyAvailable = server.moneyMax;
  }

  // cap at max
  if (isValidNumber(server.moneyMax) && server.moneyAvailable > server.moneyMax) {
    server.moneyAvailable = server.moneyMax;
  }

  // if there was any growth at all, increase security
  if (oldMoneyAvailable !== server.moneyAvailable) {
    //Growing increases server security twice as much as hacking
    let usedCycles = numCycleForGrowth(ns, server, server.moneyAvailable / oldMoneyAvailable, p, cores);
    usedCycles = Math.min(Math.max(0, Math.ceil(usedCycles)), threads);
    fortify(server, 2 * CONSTANTS.ServerFortifyAmount * usedCycles);
  }
  return server.moneyAvailable / oldMoneyAvailable;

  
}
